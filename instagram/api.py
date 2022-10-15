import tempfile
from os import path, environ
from sys import stderr

from dotenv import load_dotenv

load_dotenv()

import requests
import cloudinary.uploader
import cloudinary.api

from .errors import UploadError, ContainerCreationError
from .auth import get_user_id, get_access_token
from .constants import GRAPH_API_URL, GRAPH_API_VERSION
from .render import render

__all__ = [
	'post'
]

cloudinary.config(secure=True)

def post(text):
	with tempfile.TemporaryDirectory() as temp_dir:
		render(text, dir=temp_dir)
		image = path.join(temp_dir, 'post.png')

		try:
			resp = cloudinary.uploader.upload_image(
				image,
				folder='temp/chatur_vani/',
				overwrite=True,
				public_id='chatur_vani_post'
			)

			url = resp.build_url()
		except Exception as e:
			print('Error:', e.args, file=stderr)
			raise UploadError('Failed to upload image to public URL.')

	
	try:
		# Post on Instagram
		token = get_access_token()
		user_id = get_user_id()

		# Create container
		req_url = f'{GRAPH_API_URL}/v{GRAPH_API_VERSION}/{user_id}/media'
		resp = requests.post(req_url, params={
			'image_url':    url,
			'caption':      text,
			'access_token': token
		})
		if not resp.ok:
			print('Status code:', resp.status_code, file=stderr)
			raise ContainerCreationError('Failed to create post container.')
		container_id = resp.json().get('id')

		# Publish post
		req_url = f'{GRAPH_API_URL}/v{GRAPH_API_VERSION}/{user_id}/media_publish'
		resp = requests.post(req_url, params={
			'creation_id':  container_id,
			'access_token': token
		})
		if not resp.ok:
			print('Status code:', resp.status_code, file=stderr)
			raise ContainerCreationError('Failed to create post container.')
		post_id = resp.json().get('id')
	finally:
		cloudinary.uploader.destroy('chatur_vani_post')