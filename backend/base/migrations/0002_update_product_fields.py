# Generated manually to align the existing Product table with models.py.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='name',
            new_name='product_name',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='price',
            new_name='product_price',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='created_at',
            new_name='createdAt',
        ),
        migrations.AlterField(
            model_name='product',
            name='description',
            field=models.CharField(max_length=255),
        ),
        migrations.AddField(
            model_name='product',
            name='brand',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='product',
            name='countInStock',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='product',
            name='image',
            field=models.ImageField(default='', upload_to='product_images/'),
            preserve_default=False,
        ),
    ]
