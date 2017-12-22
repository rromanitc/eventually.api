"""
Views module
============
"""

from django.http import JsonResponse
from django.views.generic.base import View
from utils.validators import required_keys_validator
from utils.team_views_functions import (create_team_dict,
                                        update_team_dict)
from utils.responsehelper import (RESPONSE_200_DELETED,
                                  RESPONSE_200_UPDATED,
                                  RESPONSE_400_INVALID_DATA,
                                  RESPONSE_400_DB_OPERATION_FAILED,
                                  RESPONSE_403_ACCESS_DENIED,
                                  RESPONSE_404_OBJECT_NOT_FOUND,
                                  RESPONSE_400_EMPTY_JSON)
from .models import Team


class TeamView(View):
    """Team view handles GET, POST, PUT, DELETE requests."""

    def get(self, request, team_id=None):
        """
        Handles GET request, retrieves team from the database
        :param request: request from the web page
        :type request: http Request

        :param team_id: id of a team to return.
        :type team_id: int

        :return: team dictionary
            E.G.
            |    {
            |        "id": 4,
            |        "name": "team2",
            |        "description": "",
            |        "image": "",
            |        "created_at": 1510669962,
            |        "updated_at": 1510669962,
            |        "owner_id": 1,
            |        "members_id": [
            |            1
            |        ]
            |    }
        """
        if team_id:
            team = Team.get_by_id(team_id)
            if team:
                team = team.to_dict()
                return JsonResponse(team, status=200)
            return RESPONSE_404_OBJECT_NOT_FOUND
        current_user = request.user
        teams = current_user.teams.all()
        data = {'teams': [teama.to_dict() for teama in teams]}
        return JsonResponse(data, status=200)

    def post(self, request):
        """
        Handles POST request, creates a new team in database
        :param request: request from the web page
        :type request: http Request
        :Example: incoming JSON request:
        |  {
        |      "name": "team2",
        |      "description": "",
        |      "image": "",
        |      "members_id": [
        |          1
        |      ]
        |  }

        :return: status 200 if team has been created, status 400 if team hasn't been created,
        """

        data = request.body
        if not data:
            return RESPONSE_400_EMPTY_JSON
        keys_required = ['name']
        if not required_keys_validator(data, keys_required, False):
            return RESPONSE_400_INVALID_DATA
        user = request.user
        dict_data = create_team_dict(data, user)
        if dict_data and required_keys_validator(dict_data, keys_required, False):
            team = Team.create(**dict_data)
            team = team.to_dict()
            return JsonResponse(team, status=201)
        return RESPONSE_400_INVALID_DATA

    def put(self, request, team_id):
        """
        Handles PUT request, modifies the team in the datatbase.

        :param request: request from the web page with a json containing changes to be applied
        :type request: http Request
        :Example: incoming JSON request:
        | {
        |   "description":"some description",
        |   "owner": 1
        | }

        :param team_id: id of a team which has to be changed
        :type team_id: int

        :return: status 200 if team has been updated,
                 status 400 if team hasn't been updated,
                 status 403 if current user is not owner of team.
        """
        team = Team.get_by_id(team_id)
        if not team:
            return RESPONSE_404_OBJECT_NOT_FOUND
        if not request.user == team.owner:
            return RESPONSE_403_ACCESS_DENIED
        data = request.body
        if not data:
            return RESPONSE_400_EMPTY_JSON
        dict_data = update_team_dict(data, request.user)
        if dict_data:
            team.update(**dict_data)
            return RESPONSE_200_UPDATED
        return RESPONSE_400_INVALID_DATA

    def delete(self, request, team_id):
         #pylint: disable=unused-argument
        """
        Handles delete request

        :param team_id: id of a team to delete
        :type team_id: int

        :return: status 200 if team was deleted and status=400 if it was not
        """
        if not Team.get_by_id(team_id):
            return RESPONSE_404_OBJECT_NOT_FOUND
        if request.user == Team.get_by_id(team_id).owner:
            is_deleted = Team.delete_by_id(team_id)
            if is_deleted:
                return RESPONSE_200_DELETED
            return RESPONSE_400_DB_OPERATION_FAILED
        return RESPONSE_403_ACCESS_DENIED
