import pyramid.httpexceptions as exc
from pyramid.view import (
    view_config,
    notfound_view_config
)


class Home(object): 
    def __init__(self, request):
        pass

    @notfound_view_config(append_slash=True)
    def notfound(self):
        return exc.HTTPNotFound()

    @view_config(route_name='home', renderer='../templates/home.mako')
    def home(self):
        return {}


