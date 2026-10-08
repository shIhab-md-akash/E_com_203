from django.urls import path
from .views import CategoryListCreateView, CategoryDetailView

urlpatterns = [
    path('', CategoryListCreateView.as_view(), name='category_list_create'),
    path('<int:id>/', CategoryDetailView.as_view(), name='category_detail'),
]
