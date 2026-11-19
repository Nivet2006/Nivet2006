from django.urls import path
from django.views.generic import RedirectView

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("index.html", RedirectView.as_view(pattern_name="home", permanent=True)),
    path("about/", views.about, name="about"),
    path("about.html", RedirectView.as_view(pattern_name="about", permanent=True)),
    path("projects/", views.projects, name="projects"),
    path("projects.html", RedirectView.as_view(pattern_name="projects", permanent=True)),
    path("splash/", views.splash, name="splash"),
    path("splash.html", RedirectView.as_view(pattern_name="splash", permanent=True)),
]
