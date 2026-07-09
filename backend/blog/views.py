from __future__ import annotations

import logging

from django.db.models import F, Q
from django.http import Http404
from django.utils import timezone
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from accounts.permissions import IsAdminUserRole
from config.pagination import StandardResultsSetPagination
from .models import Blog, BlogImage, Tag
from .serializers import BlogDetailSerializer, BlogImageSerializer, BlogListSerializer, BlogWriteSerializer, TagSerializer

logger = logging.getLogger(__name__)


class BlogViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "subtitle", "content", "course__title", "course__category__name", "tags__name", "author__name"]
    ordering_fields = ["publish_date", "views", "title", "created_at", "updated_at", "is_featured"]
    ordering = ["-publish_date", "-created_at"]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy", "images"}:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return BlogWriteSerializer
        if self.action == "retrieve":
            return BlogDetailSerializer
        return BlogListSerializer

    def get_queryset(self):
        queryset = (
            Blog.objects.select_related("author", "course", "course__category", "lesson")
            .prefetch_related("tags", "images")
            .distinct()
        )
        user = self.request.user
        include_unpublished = self.request.query_params.get("include_unpublished") == "1"
        admin_actions = {"create", "update", "partial_update", "destroy", "images"}
        if self.action == "retrieve":
            admin_actions.add("retrieve")
        if not (
            user
            and user.is_authenticated
            and (user.is_staff or user.is_superuser)
            and (include_unpublished or self.action in admin_actions)
        ):
            queryset = queryset.filter(status=Blog.STATUS_PUBLISHED, publish_date__lte=timezone.now())

        course = self.request.query_params.get("course")
        category = self.request.query_params.get("category")
        tag = self.request.query_params.get("tag")
        status_filter = self.request.query_params.get("status")
        featured = self.request.query_params.get("featured")
        series = self.request.query_params.get("series") or self.request.query_params.get("series_name")

        if course:
            queryset = queryset.filter(course_id=course)
        if category:
            queryset = queryset.filter(course__category__name__iexact=category)
        if tag:
            queryset = queryset.filter(Q(tags__slug=tag) | Q(tags__name__iexact=tag))
        if status_filter and include_unpublished:
            queryset = queryset.filter(status=status_filter)
        if featured in {"true", "1"}:
            queryset = queryset.filter(is_featured=True)
        if series:
            queryset = queryset.filter(series_name__iexact=series)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action == "retrieve" and getattr(self, "object", None):
            current = self.object
            public_qs = self._public_queryset().exclude(pk=current.pk)

            previous_blog = None
            next_blog = None

            if current.series_name:
                series_qs = self._public_queryset().filter(series_name=current.series_name)
                previous_blog = series_qs.filter(series_order__lt=current.series_order).order_by("-series_order", "-publish_date").first()
                next_blog = series_qs.filter(series_order__gt=current.series_order).order_by("series_order", "publish_date").first()
            elif current.course:
                course_qs = self._public_queryset().filter(course=current.course)
                previous_blog = course_qs.filter(series_order__lt=current.series_order).order_by("-series_order", "-publish_date").first()
                next_blog = course_qs.filter(series_order__gt=current.series_order).order_by("series_order", "publish_date").first()

            if not previous_blog:
                previous_blog = public_qs.filter(publish_date__lt=current.publish_date).order_by("-publish_date").first()
            if not next_blog:
                next_blog = public_qs.filter(publish_date__gt=current.publish_date).order_by("publish_date").first()

            context["previous_blog"] = previous_blog
            context["next_blog"] = next_blog
            context["recommended_blogs"] = self._recommended_for(current, public_qs)[:3]
        return context

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        logger.info("Blog lookup requested", extra={"blog_lookup_field": self.lookup_field, "blog_lookup_value": lookup_value, "blog_action": self.action})
        try:
            obj = super().get_object()
        except Http404 as exc:
            logger.warning("Blog lookup failed", extra={"blog_lookup_field": self.lookup_field, "blog_lookup_value": lookup_value, "blog_action": self.action})
            raise NotFound(detail=f"No Blog matches the given {self.lookup_field}.") from exc
        logger.info("Blog lookup resolved", extra={"blog_id": obj.pk, "blog_slug": obj.slug, "blog_action": self.action})
        return obj

    def retrieve(self, request, *args, **kwargs):
        self.object = self.get_object()
        Blog.objects.filter(pk=self.object.pk).update(views=F("views") + 1)
        self.object.refresh_from_db(fields=["views"])
        serializer = self.get_serializer(self.object)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def trending(self, request):
        queryset = self.filter_queryset(self._public_queryset().order_by("-views", "-publish_date"))[:6]
        return Response(BlogListSerializer(queryset, many=True, context=self.get_serializer_context()).data)

    @action(detail=False, methods=["get"])
    def recommended(self, request):
        course_id = request.query_params.get("course")
        blog_slug = request.query_params.get("blog")
        queryset = self._public_queryset()
        if blog_slug:
            current = queryset.filter(slug=blog_slug).first()
            queryset = self._recommended_for(current, queryset.exclude(pk=current.pk)) if current else queryset
        elif course_id:
            queryset = queryset.filter(course_id=course_id)
        queryset = queryset[:6]
        return Response(BlogListSerializer(queryset, many=True, context=self.get_serializer_context()).data)

    @action(detail=False, methods=["get"])
    def tags(self, request):
        tags = Tag.objects.filter(blogs__status=Blog.STATUS_PUBLISHED).distinct().order_by("name")
        return Response(TagSerializer(tags, many=True).data)

    @action(detail=False, methods=["get"])
    def categories(self, request):
        from django.db.models import Count
        categories_qs = Blog.objects.filter(
            status=Blog.STATUS_PUBLISHED,
            publish_date__lte=timezone.now()
        ).values('course__category__name').annotate(count=Count('id')).order_by('-count')

        data = [
            {
                "name": item['course__category__name'] or "General",
                "count": item['count']
            }
            for item in categories_qs if item['course__category__name']
        ]
        return Response(data)

    @action(detail=False, methods=["get"])
    def courses(self, request):
        from django.db.models import Count
        courses_qs = Course.objects.filter(
            blogs__status=Blog.STATUS_PUBLISHED,
            blogs__publish_date__lte=timezone.now()
        ).annotate(count=Count('blogs')).filter(count__gt=0).order_by('title')

        data = [
            {
                "id": c.id,
                "title": c.title,
                "slug": c.slug,
                "count": c.count
            }
            for c in courses_qs
        ]
        return Response(data)

    @action(detail=True, methods=["post", "get"], parser_classes=[MultiPartParser, FormParser])
    def images(self, request, slug=None):
        blog = self.get_object()
        if request.method == "GET":
            return Response(BlogImageSerializer(blog.images.all(), many=True, context=self.get_serializer_context()).data)
        serializer = BlogImageSerializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        image = serializer.save(blog=blog)
        return Response(BlogImageSerializer(image, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)

    def _public_queryset(self):
        return (
            Blog.objects.filter(status=Blog.STATUS_PUBLISHED, publish_date__lte=timezone.now())
            .select_related("author", "course", "course__category", "lesson")
            .prefetch_related("tags")
            .order_by("-publish_date", "-created_at")
        )

    def _recommended_for(self, current, queryset):
        if not current:
            return queryset.order_by("-publish_date")
        tag_ids = list(current.tags.values_list("id", flat=True))
        related = queryset.filter(Q(course=current.course) | Q(tags__in=tag_ids) | Q(course__category=current.course.category)).distinct()
        fallback = queryset.exclude(pk__in=related.values("pk"))
        return list(related.order_by("-publish_date")[:6]) + list(fallback.order_by("-publish_date")[:6])
