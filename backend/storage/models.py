from django.db import models
import secrets


class Folder(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE,
                               null=True, blank=True)
    owner = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('name', 'parent', 'owner')


class File(models.Model):
    file = models.FileField(upload_to='uploads/')
    name = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    size = models.PositiveIntegerField(default=0)
    owner = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL,
                               null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.file.name
        self.size = self.file.size
        super().save(*args, **kwargs)


class SharedFile(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    token = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(25)
        super().save(*args, **kwargs)
