import json
import urllib.error
import urllib.request

from django.core.cache import cache
from django.shortcuts import render


def home(request):
    return render(request, "portfolio/home.html", {"title": "Home"})


def about(request):
    return render(request, "portfolio/about.html", {"title": "About"})


def splash(request):
    return render(request, "portfolio/splash.html", {"title": "Splash"})


def not_found(request, exception):
    return render(request, "portfolio/404.html", {"title": "Not Found"}, status=404)


def projects(request):
    repositories = cache.get("nivet2006_repositories")
    if repositories is None:
        repositories = []
        api_url = "https://api.github.com/users/Nivet2006/repos?per_page=100&sort=updated"
        request_headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "Nivet2006-Portfolio",
        }

        try:
            github_request = urllib.request.Request(api_url, headers=request_headers)
            with urllib.request.urlopen(github_request, timeout=8) as response:
                repositories = json.loads(response.read().decode("utf-8"))
            repositories = [
                repo
                for repo in repositories
                if not repo.get("fork")
            ]
            repositories.sort(
                key=lambda repo: repo.get("updated_at") or "",
                reverse=True,
            )
            cache.set("nivet2006_repositories", repositories, timeout=900)
        except (OSError, urllib.error.URLError, json.JSONDecodeError):
            repositories = []

    return render(
        request,
        "portfolio/projects.html",
        {"title": "Projects", "repositories": repositories},
    )
