---
date: 2026-06-24 12:00:00 +0000
title: Mapping Elkhorn Coral with Drone Imagery and Deep Learning
subtitle: TNC / Duke Master's Project
image: /images/projects/TNC_Corals/hero-drone-reef.jpg
---
During my master's work at Duke, I worked with The Nature Conservancy on a computer vision workflow for mapping elkhorn coral around St. Croix in the U.S. Virgin Islands. The goal was practical: restoration teams need better ways to measure where elkhorn coral is present, how much area it covers, and how those patterns change across reef sites. Doing that manually from high-resolution drone orthomosaics is slow, inconsistent, and difficult to scale.

This project explored whether drone imagery, GIS annotations, and deep learning could make that workflow faster.

![Drone imagery of shallow reef habitat near St. Croix.](/images/projects/TNC_Corals/drone-reef-detail.jpg)

## Why Elkhorn Coral?

Elkhorn coral, *Acropora palmata*, is an endangered reef-building coral. Its branching structure creates habitat for reef organisms, contributes to reef growth, and helps buffer coastlines from wave energy. Around St. Croix, The Nature Conservancy has been involved in coral restoration work since 2012, but measuring restoration success across large reef areas remains a hard geospatial monitoring problem.

In August 2023, our team collected drone imagery over reef tracts in the U.S. Virgin Islands using a Wingtra Gen II drone. Those images were stitched into orthomosaics with DroneDeploy. The resulting imagery was detailed enough to identify coral colonies, but the files were large enough that manual review was not a realistic long-term solution.

![Sample drone images from the project dataset.](/images/projects/TNC_Corals/sample-drone-contact-sheet.jpg)

## The Workflow

The core workflow combined GIS labeling with deep learning:

1. Build high-resolution orthomosaics from drone imagery.
2. Digitize training polygons around visible coral colonies.
3. Label examples as elkhorn coral, fire coral, or mounding coral.
4. Export image chips and masks for deep learning.
5. Train object detection and instance segmentation models.
6. Run inference on a subset of reef imagery.
7. Compare detections against the imagery and model validation metrics.

The tutorial notebook created for the class project walked through this workflow using ArcGIS Pro, `arcpy`, `arcgis.learn`, GeoPandas, Rasterio, Folium, and Matplotlib. It used a smaller orthomosaic subset so a user could train and run a model without needing to process a full 30 GB raster.

## Training Data

We digitized coral examples inside transects so the training data would include different depths and reef conditions. The classes were:

- `Palmata`: elkhorn coral, *Acropora palmata*
- `Millepora`: fire coral
- `Mounding`: other mounding coral forms

The exported deep learning dataset contained 1,292 image chips. The mask counts in the tutorial data were:

| Class | Mask files |
| --- | ---: |
| Palmata | 955 |
| Millepora | 335 |
| Mounding | 112 |

That class distribution mattered. The model saw many more examples of elkhorn coral than mounding coral, and the visual differences between coral classes were sometimes subtle in overhead drone imagery.

## Models Tested

The project included experiments with Faster R-CNN and Mask R-CNN models in the ArcGIS deep learning toolset. Faster R-CNN is an object detector, while Mask R-CNN performs instance segmentation by producing a mask for each detected object. Mask R-CNN was especially relevant because coral area and colony footprint are often more useful than bounding boxes alone.

The strongest model metadata I found in the project folder reported these average precision values:

| Model | Palmata AP | Notes |
| --- | ---: | --- |
| Llew2_26_FasterRCNN | 0.701 | Best elkhorn detection score in the saved model metadata |
| Trial4_MaskRCNN_Model | 0.661 | Better segmentation-oriented candidate |
| Llew2_26_Wyatt_MaskRCNN | 0.515 | Lower elkhorn precision in this run |

![Faster R-CNN model sample results.](/images/projects/TNC_Corals/fasterrcnn-results.png)

![Mask R-CNN model sample results.](/images/projects/TNC_Corals/maskrcnn-results.png)

The results were promising, but not reliable enough to treat as a finished ecological monitoring product. The best elkhorn precision was near the rough threshold we considered useful, but performance across coral classes remained uneven.

## What Made the Problem Hard

Several details made this more difficult than a standard image classification problem.

First, the imagery was geospatial and very large. A full orthomosaic could contain thousands of tiles, so the workflow had to preserve spatial reference while splitting rasters into manageable chunks.

Second, the target object was biologically and visually messy. Elkhorn colonies vary in shape, color, and visibility. Their appearance changes with depth, water clarity, sun angle, substrate, and neighboring benthic cover.

Third, the labels were expensive. Every training polygon required a human to inspect reef imagery and decide what class the coral belonged to. That makes class imbalance and annotation consistency real constraints, not just modeling details.

Finally, detection and segmentation have different ecological uses. Bounding boxes can help find candidate colonies quickly, but masks are more useful for estimating area. The more useful output was also harder to produce accurately.

![Faster R-CNN training loss graph.](/images/projects/TNC_Corals/fasterrcnn-loss.png)

![Mask R-CNN training loss graph.](/images/projects/TNC_Corals/maskrcnn-loss.png)

## Segment Anything Experiments

Later project files also show experiments with Meta's Segment Anything Model using `samgeo`. That work explored automatic mask generation, tiling a full orthomosaic, converting masks back into GIS vector formats, and fine-tuning SAM-style workflows on coral masks.

This was a useful direction because SAM could generate object-like masks without the same fully supervised setup. But it also surfaced a core issue: generic segmentation is not the same as ecological classification. A model can segment many reef objects while still not knowing which masks correspond to elkhorn coral.

For this use case, the most promising direction would likely combine the two approaches: use broad segmentation to propose candidate objects, then classify or filter those candidates with coral-specific training data.

## Takeaways

This project did not produce a production-ready coral monitoring model, but it did build a working geospatial deep learning pipeline:

- drone imagery to orthomosaic;
- hand-labeled coral training polygons;
- exported chips and masks;
- trained object detection and segmentation models;
- inference outputs that could be brought back into GIS;
- early experiments with foundation-model segmentation.

The main lesson was that automating coral mapping is feasible, but the bottleneck is not only model architecture. It is the whole system: image quality, georeferencing, training-data design, annotation consistency, class balance, and how outputs will be checked by scientists and restoration teams.

For me, the project was a useful bridge between conservation science and applied machine learning. It showed how computer vision can help with environmental monitoring, while also making clear that field context and GIS workflows matter as much as the model itself.

## Project Artifacts

- Tutorial notebook: `FinalProject_HD_IB/DLTutorial_ObjectDetection.ipynb`
- SAM exploration notebook: `TNC_LlewsReef_igb8/SAM_Llews_.ipynb`
- Model folders: `TNC_LlewsReef_igb8/Data/TNC Coral Mapping/Model`
- Sample drone imagery: `TNC_LlewsReef_igb8/sample drone imagery`

## Asset Notes

The web images on this page are derivatives from the local project files. The hero and reef detail images come from sample drone imagery in `TNC_LlewsReef_igb8/sample drone imagery`; the contact sheet uses the first six `.jpg` files in that folder. The model result and loss images come from the saved `ModelCharacteristics` outputs for `Llew2_26_FasterRCNN` and `Trial4_MaskRCNN_Model`.
