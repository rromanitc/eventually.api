"""
Curriculum model
================
"""
# pylint: disable=arguments-differ

import pickle
from django.conf import settings
from django.core.cache import cache
from django.db import models, IntegrityError
from django.contrib.postgres.fields import ArrayField
from team.models import Team
from utils.abstractmodel import AbstractModel
from utils.utils import LOGGER

CACHE_TTL = settings.CACHE_TTL

class Curriculum(AbstractModel):
    """
    Curriculum model class
    Attributes:
    ===========
        :param name: name of the curriculum, can't be blank
        :type name: str

        :param goals: list of goals to be achieved during the curriculum
        :type goals: list

        :param description: description of the curriculum
        :type description: str

        :param team: id of teams which are studying by the curriculum
        :type team: int

        :param created_at: Describes the date when the curriculum was created
        :type created_at: datetime

        :param updated_at: Describes the date when the curriculum was modified
        :type updated_at: datetime
    """

    name = models.CharField(max_length=50, unique=True, blank=False)
    goals = ArrayField(models.CharField(max_length=30, blank=False), size=8, null=True)
    description = models.TextField(max_length=500, blank=True)
    team = models.ForeignKey(Team, null=True, related_name='team')
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def get_by_name(curriculum_name):
        """
        :param curriculum_name: name of a curriculum in the DB
        :type curriculum_id: str
        :return: Curriculum object or None
        """
        redis_key = 'curriculum_by_name_{0}'.format(curriculum_name)
        if redis_key in cache:
            curriculum = pickle.loads(cache.get(redis_key))
            return curriculum
        try:
            curriculum = Curriculum.objects.get(name=curriculum_name)
        except Curriculum.DoesNotExist:
            LOGGER.error("Curriculum does not exist")
            return None
        cached_curriculum = pickle.dumps(curriculum)
        cache.set(redis_key, cached_curriculum, CACHE_TTL)
        return curriculum

    @staticmethod
    def create(name, description='', goals=(), team=None):
        """
        Create a new Curriculum object in the database

        :param name: name of the curriculum
        :type name: str

        :param description: description of the curriculum
        :type description: str

        :param goals: list of goals to be achieved during the curriculum
        :type goals: list

        :param team: id of teams which study the curriculum
        :type team: list

        :return: Curriculum object or none
        """

        try:
            new_curriculum = Curriculum.objects.create(name=name,
                                                       description=description,
                                                       goals=goals,
                                                       team=team)
            new_curriculum.save()
            if "all_curriculums" in cache:
                cache.delete("all_curriculums")
            return new_curriculum
        except IntegrityError:
            LOGGER.error("Relational integrity error")


    def to_dict(self):
        """
        Make a dict from the Curriculum object
        :return: Curriculum object dictionary
        :Example:
        | {
        |   'id:': 1,
        |   'name:': 'reading',
        |   'description': 'shakespeare',
        |   'goals': ['Be a Senior dev'],
        |   'team': 'Team(id=1)',
        |   'created': 1511386400,
        |   'updated': 1511394690
        | }
        """

        return {'id': self.id,
                'name': self.name,
                'description': self.description,
                'goals': self.goals,
                'team': self.team,
                'created': int(self.created_at.timestamp()),
                'updated': int(self.updated_at.timestamp())
               }


    def update(self, name=None, description=None, team=None):
        """
        Updates the curriculum object

        :param name: name for the curriculum object
        :type name: str

        :param description: description for the curriculum object
        :type description: str

        :param team: id of teams which study the curriculum
        :type team: list

        :return: True if updated or None
        """

        if name:
            self.name = name
        if description:
            self.description = description
        if team:
            self.team = team
        try:
            self.save()
            redis_key = 'curriculum_by_id_{0}'.format(self.id)
            if redis_key in cache:
                cache.delete(redis_key)
            if "all_curriculums" in cache:
                cache.delete("all_curriculums")
            return True

        except (IntegrityError, AttributeError):
            LOGGER.error("Inappropriate values or relational integrity error")

    @staticmethod
    def get_all():
        """
        returns data for json request with querysets of all curriculums
        """
        redis_key = "all_curriculums"
        if redis_key in cache:
            all_curriculums = cache.get(redis_key)
            all_curriculums = pickle.loads(all_curriculums)
            return all_curriculums
        all_curriculums = Curriculum.objects.all()
        cached_curriculums = pickle.dumps(all_curriculums)
        cache.set(redis_key, cached_curriculums, CACHE_TTL)
        return all_curriculums

    @staticmethod
    def get_by_id(curriculum_id):
        """
        returns object of Curriculum by id
        """
        redis_key = 'curriculum_by_id_{0}'.format(curriculum_id)
        if redis_key in cache:
            curriculum = pickle.loads(cache.get(redis_key))
            return curriculum
        try:
            curriculum = Curriculum.objects.get(id=curriculum_id)
        except Curriculum.DoesNotExist:
            return None
        cached_curriculum = pickle.dumps(curriculum)
        cache.set(redis_key, cached_curriculum, CACHE_TTL)
        return curriculum
