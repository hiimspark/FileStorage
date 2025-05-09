from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from .models import File, SharedFile, Folder
from .serializers import FileSerializer, SharedFileSerializer, FolderSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.utils import timezone
import os
from django.core.exceptions import ValidationError


class FileUploadView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        folder_id = self.request.data.get('folder')
        folder = None
        if folder_id:
            folder = get_object_or_404(Folder, id=folder_id,
                                       owner=self.request.user)
        serializer.save(owner=self.request.user, folder=folder)


class FileListView(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return File.objects.filter(owner=self.request.user)


class RootFolderListView(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(owner=self.request.user, parent=None)


class ShareFileView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SharedFileSerializer

    def post(self, request, file_id):
        file = get_object_or_404(File, id=file_id, owner=request.user)
        shared_file = SharedFile.objects.create(
            file=file,
            expires_at=timezone.now() + timezone.timedelta(days=7)
        )
        return Response({"token": shared_file.token,
                         "expires_at": shared_file.expires_at})


class SharedFileView(APIView):
    def get(self, request, token):
        shared_file = get_object_or_404(SharedFile, token=token)
        if shared_file.expires_at and shared_file.expires_at <= timezone.now():
            return Response(
                {"error": "Срок действия ссылки истёк"},
                status=status.HTTP_410_GONE
            )
        file = shared_file.file
        serializer = FileSerializer(file)
        return Response({
            "file": serializer.data,
            "download_url": f"/api/shared/{token}/download/",
            "expires_at": shared_file.expires_at
        })


class DownloadSharedFileView(APIView):
    def get(self, request, token):
        shared_file = get_object_or_404(SharedFile, token=token)
        file = shared_file.file.file
        return FileResponse(file, as_attachment=True, filename=file.name)


class DownloadFileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        file = get_object_or_404(File, id=file_id, owner=request.user)
        return FileResponse(file.file, as_attachment=True, filename=file.name)


class DeleteFileView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        file = get_object_or_404(File, id=file_id, owner=request.user)
        SharedFile.objects.filter(file=file).delete()
        os.remove(file.file.path)
        file.delete()
        return Response(
            {"message": "Файл успешно удалён"},
            status=status.HTTP_204_NO_CONTENT
        )


class FolderListView(generics.ListCreateAPIView):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class FolderContentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, folder_id):
        folder = get_object_or_404(Folder, id=folder_id, owner=request.user)
        files = File.objects.filter(folder=folder)
        subfolders = Folder.objects.filter(parent=folder)
        return Response({
            'files': FileSerializer(files, many=True).data,
            'subfolders': FolderSerializer(subfolders, many=True).data
        })


class DeleteFolderView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, folder_id):
        folder = get_object_or_404(Folder, id=folder_id, owner=request.user)
        files = File.objects.filter(folder=folder)
        subfolders = Folder.objects.filter(parent=folder)

        if (files):
            raise ValidationError("Нельзя удалить непустую папку")
        if (subfolders):
            raise ValidationError("Нельзя удалить непустую папку")

        folder.delete()
        return Response(
            {"message": "Папка успешно удалена"},
            status=status.HTTP_204_NO_CONTENT
        )


class AddFileToFolder(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, folder_id, file_id):
        if folder_id != 0:
            folder = get_object_or_404(Folder, id=folder_id,
                                       owner=request.user)
        else:
            folder = None
        File.objects.filter(id=file_id).update(folder=folder)
        return Response({"folder": folder_id})
