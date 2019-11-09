from PIL import Image

# for whole star
for i in range(2, 6):
	images = [Image.open("1.png") for j in range(i)]
	widths, heights = zip(*(i.size for i in images))

	totalWidth = sum(widths)
	totalHeight = max(heights)

	combineImage = Image.new('RGBA', (totalWidth, totalHeight))

	x_offset = 0
	for image in images:
		combineImage.paste(image, (x_offset, 0))
		x_offset += image.size[0]
	combineImage.save(str(i) + ".png")

for i in range(1, 5):
	images = [Image.open(str(i) + ".png"), Image.open("half.png")]
	widths, heights = zip(*(i.size for i in images))
	
	totalWidth = sum(widths)
	totalHeight = max(heights)

	combineImage = Image.new('RGBA', (totalWidth, totalHeight))

	x_offset = 0
	for image in images:
		combineImage.paste(image, (x_offset, 0))
		x_offset += image.size[0]
	combineImage.save(str(i) + "-half" + ".png")