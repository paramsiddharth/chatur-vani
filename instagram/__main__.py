from render import render

print('Hi!')

output = render('Hi!', dir=':-')
if output is not None:
	print(output)