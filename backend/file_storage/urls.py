from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from storage.views import FileListView, FileUploadView, ShareFileView
from storage.views import DownloadFileView, DownloadSharedFileView
from storage.views import DeleteFileView, FolderListView, FolderContentsView
from storage.views import DeleteFolderView, AddFileToFolder, RootFolderListView
from storage.views import SharedFileView

router = DefaultRouter()
router.register(r'files', FileListView, basename='files')
router.register(r'folders', RootFolderListView, basename='folders')


urlpatterns = [
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.authtoken')),
    path('api/', include(router.urls)),
    path('api/upload/', FileUploadView.as_view(), name='file-upload'),
    path('api/files/<int:file_id>/share/', ShareFileView.as_view(),
         name='share-file'),
    path('api/files/<int:file_id>/download/', DownloadFileView.as_view(),
         name='download-file'),
    path('api/shared/<str:token>/', SharedFileView.as_view(),
         name='view-shared'),
    path('api/shared/<str:token>/download/', DownloadSharedFileView.as_view(),
         name='download-shared'),
    path('api/files/<int:file_id>/delete/', DeleteFileView.as_view(),
         name='delete-file'),
    path('api/folders/create', FolderListView.as_view(), name='folder-list'),
    path('api/folders/<int:folder_id>/contents/', FolderContentsView.as_view(),
         name='folder-contents'),
    path('api/folders/<int:folder_id>/delete/', DeleteFolderView.as_view(),
         name='delete-folder'),
    path('api/files/<int:file_id>/add-to/<int:folder_id>/',
         AddFileToFolder.as_view(), name='add-file-to-folder'),


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
