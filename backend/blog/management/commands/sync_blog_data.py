from django.core.management.base import BaseCommand
from django.conf import settings
from blog.models import Blog
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    help = "Sync local SQLite blogs to Supabase"

    def handle(self, *args, **options):
        if "local_sqlite" in settings.DATABASES:
            # Supabase is healthy (default). Local is local_sqlite
            source_db = "local_sqlite"
            target_db = "default"
        elif "remote_supabase" in settings.DATABASES:
            # Supabase is down (remote_supabase). Default is local SQLite
            source_db = "default"
            target_db = "remote_supabase"
            try:
                connections[target_db].cursor()
            except OperationalError:
                self.stdout.write(self.style.ERROR("Supabase is still offline. Cannot sync."))
                return
        else:
            self.stdout.write(self.style.ERROR("Database configuration doesn't support syncing."))
            return

        try:
            local_blogs = Blog.objects.using(source_db).all()
        except OperationalError:
            self.stdout.write(self.style.WARNING("Source database doesn't have the table. Skipping."))
            return
            
        synced = 0
        for blog in local_blogs:
            try:
                tags = list(blog.tags.all())
                
                if not Blog.objects.using(target_db).filter(slug=blog.slug).exists():
                    blog.save(using=target_db)
                    blog.tags.set(tags)
                    synced += 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Failed to sync blog {blog.slug}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Synced {synced} blogs to Supabase."))
