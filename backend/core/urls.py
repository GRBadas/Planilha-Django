from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect  # Importação correta

def redirect_to_api(request):
    return redirect('/api/')

urlpatterns = [
    path('', redirect_to_api),  # Redireciona a raiz para /api/
    path('admin/', admin.site.urls),
    path('api/', include('gastos.urls')),
]
