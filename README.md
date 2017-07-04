# Trianglize

Upload any image to see it stylized using triangles.

[Try it out!](https://jmstewart.github.io/trianglize/)

## How it Works

We create a random set of points on top of the image, and compute a [constrained Delaunay triangulation](https://en.wikipedia.org/wiki/Constrained_Delaunay_triangulation) using the [poly2tri](https://www.npmjs.com/package/poly2tri) library. The borders are set as constraints for the triangulization algorithm in order to make sure that the triangles completely cover the image. For each triangle, we calculate the centroid point, read the color from the original image at that point, and fill the triangle with that color.
