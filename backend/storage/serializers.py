from rest_framework import serializers
from .models import File, SharedFile, Folder
from django.utils import timezone


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent', 'created_at']


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file', 'name', 'folder', 'uploaded_at', 'size',
                  'owner']
        read_only_fields = ['owner']


class SharedFileSerializer(serializers.ModelSerializer):
    expires_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_expires_at(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("Дата должна быть в будущем.")
        return value

    class Meta:
        model = SharedFile
        fields = ['file', 'expires_at']


class FileDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['file']
