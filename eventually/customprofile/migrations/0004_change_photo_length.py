# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-12-28 19:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customprofile', '0003_fix_birthday_null_true'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customprofile',
            name='photo',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
