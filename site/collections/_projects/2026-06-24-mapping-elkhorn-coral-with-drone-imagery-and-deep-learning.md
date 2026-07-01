---
date: 2026-06-24 12:00:00 +0000
title: Mapping Elkhorn Coral with Drone Imagery and Deep Learning
subtitle: TNC / Duke Master's Project
image: /images/projects/TNC_Corals/hero-drone-reef.jpg
---
During my master's work at Duke, I worked with [The Nature Conservancy](https://www.nature.org/en-us/about-us/where-we-work/caribbean/) (TNC) on a computer vision workflow for mapping elkhorn coral around St. Croix in the U.S. Virgin Islands. Coral restoration teams at The Nature Conservancy's Caribbean Division need better ways to measure where elkhorn coral is present, how much area it covers, and how those patterns change across reef sites. Divers can only count coral in small sections of the reef, but what if elkhorn coral could be counted across the entire reef in drone imagery?

This project explored whether drone orthomosaics, GIS annotations, and deep learning could make that workflow faster.

![Drone imagery of shallow reef habitat near St. Croix.](/images/projects/TNC_Corals/drone-reef-detail.jpg)
*Drone imagery of shallow reef habitat near St. Croix.*

## St. Croix Data Collection

In August 2023, a team from TNC's Caribbean Division collected drone imagery over reef tracts including Llew's Reef in the U.S. Virgin Islands using a [Wingtra Gen II fixed-wing mapping drone](https://wingtra.com/). I joined that team for a second field excursion in January 2024, where even more reef imagery was collected following a severe bleaching event.

![Wingtra Gen II drone staged near the water before a reef mapping flight.](/images/projects/TNC_Corals/wingtra-gen-ii-field.jpeg)
*Wingtra Gen II drone staged near the water before a reef mapping flight.*

During my trip to St. Croix, I also got to see TNC's Coral Innovation Hub. The lab connects restoration work in the water with controlled, hands-on coral propagation on land. Small coral fragments and samples are maintained on labeled plugs and racks, where staff can track growth, health, genotype, and readiness for future restoration work. Seeing all the small living samples in the lab made me hopeful that the reef could continue on, even in the context of a recent bleaching event.

![Small coral samples growing on labeled plugs and racks at TNC's Coral Innovation Hub.](/images/projects/TNC_Corals/coral-innovation-hub-samples.jpeg)
*Small coral samples growing on labeled plugs and racks at TNC's Coral Innovation Hub.*

St. Croix was an amazing place to visit and has vibrant natural beauty, from the island's dry hillsides and protected bays to the shallow reef systems that motivated this project.

![View across the hills and coastline of St. Croix.](/images/projects/TNC_Corals/st-croix-overlook.jpg)
*View across the hills and coastline of St. Croix.*

The drone images collected in 2023 were stitched into orthomosaics with [DroneDeploy](https://www.dronedeploy.com/). Unfortunately, large waves and white water due to poor weather conditions made building orthomosaics for the 2024 data challenging. The resulting orthomosaics from 2023 were detailed enough to identify coral colonies, but the files were large enough that manual review was not a realistic long-term solution.

## Why Elkhorn Coral?

[Elkhorn coral](https://www.fisheries.noaa.gov/species/elkhorn-coral), *Acropora palmata*, is an endangered reef-building coral and one of the most important corals in the Caribbean. Its branching structure creates habitat for reef organisms, contributes to reef growth, and helps buffer coastlines from wave energy. Around St. Croix, The Nature Conservancy has been involved in coral restoration work since 2012, but measuring restoration success across large reef areas remains a hard monitoring problem.

Monitoring elkhorn coral from drone imagery is useful because it can expand the scale of observation without replacing the expertise of divers and restoration practitioners. A diver survey is still essential for confirming species, health, disease, bleaching, and fine-scale ecological condition. But drone imagery can cover much larger areas in a repeatable way, creating a spatial record that can be compared across years or after major events. If an automated workflow can flag likely elkhorn colonies, estimate colony footprints, and guide where humans should look more closely, restoration teams can spend less time searching through imagery and more time making management decisions.

![Sample drone images from the project dataset.](/images/projects/TNC_Corals/sample-drone-contact-sheet.jpg)
*Sample drone images from the project dataset.*

## The Workflow

The core workflow combined GIS labeling with deep learning:

1. Build high-resolution orthomosaics from drone imagery.
2. Digitize training polygons around visible coral colonies.
3. Label examples as elkhorn coral, fire coral, or mounding coral.
4. Export image chips and masks for deep learning.
5. Train object detection and instance segmentation models.
6. Run inference on a subset of reef imagery.
7. Compare detections against the imagery and model validation metrics.

The tutorial notebook created for the class project walked through this workflow using ArcGIS Pro, `arcpy`, [`arcgis.learn`](https://developers.arcgis.com/python/), GeoPandas, Rasterio, Folium, and Matplotlib. It used a smaller orthomosaic subset so a user could train and run a model without needing to process a full 30 GB raster.

## Training Data

My partner in this project, Nicholas School alum Hayden Dubniczki, and I digitized coral examples inside orthomosaic transects so the training data would include different depths and reef conditions. The classes were:

- `Palmata`: elkhorn coral, *Acropora palmata*
- `Millepora`: fire coral
- `Mounding`: other mounding coral forms

The exported deep learning dataset contained 1,292 image chips. The mask counts in the tutorial data were:

| Class | Mask files |
| --- | ---: |
| Palmata | 955 |
| Millepora | 335 |
| Mounding | 112 |

The model saw many more examples of elkhorn coral than mounding coral, and the visual differences between coral classes were sometimes subtle in overhead drone imagery.

## Models Tested

The project included experiments with [Faster R-CNN](https://developers.arcgis.com/python/latest/guide/how-faster-rcnn-works/) and [Mask R-CNN](https://developers.arcgis.com/python/latest/guide/how-maskrcnn-works/) models in the ArcGIS deep learning toolset. Faster R-CNN is an object detector, while Mask R-CNN performs instance segmentation by producing a mask for each detected object. Mask R-CNN was especially relevant because coral area and colony footprint are often more useful than bounding boxes alone.

The Faster R-CNN model provided the strongest elkhorn detection score, while the Mask R-CNN model trailed behind it slightly.

| Model | Palmata AP | Notes |
| --- | ---: | --- |
| Llew2_26_FasterRCNN | 0.701 | Best elkhorn detection score in the saved model metadata |
| Trial4_MaskRCNN_Model | 0.661 | Better segmentation-oriented candidate |

![Faster R-CNN model sample results.](/images/projects/TNC_Corals/fasterrcnn-results.png)
*Faster R-CNN model sample results.*

![Mask R-CNN model sample results.](/images/projects/TNC_Corals/maskrcnn-results.png)
*Mask R-CNN model sample results.*

The results were promising, but not reliable enough to treat as a finished ecological monitoring product. The best elkhorn precision was near the rough threshold we considered useful, but performance across coral classes remained uneven.

## What Made the Problem Hard

Several details made this more difficult than a standard image classification problem.

First, the imagery was very large. The orthomosaics we were working with could be split up into thousands of tiles, and the workflow had to preserve spatial reference while splitting rasters into manageable chunks.

Second, the target object was biologically and visually messy. Elkhorn colonies vary in shape, color, and visibility. Their appearance changes with depth, water clarity, sun angle, substrate, and neighboring benthic cover.

Third, the labels were expensive. Every training polygon required a human to inspect reef imagery and decide what class the coral belonged to. Then, the spindly arms of the elkhorn coral had to be painstakingly digitized into segmentation training data. This made class imbalance and annotation consistency significant constraints.

Finally, detection and segmentation have different ecological uses. Bounding boxes can help find candidate colonies quickly, but masks are more useful for estimating area. The more useful output was also harder to produce accurately.

![Faster R-CNN training loss graph.](/images/projects/TNC_Corals/fasterrcnn-loss.png)
*Faster R-CNN training loss graph.*

![Mask R-CNN training loss graph.](/images/projects/TNC_Corals/maskrcnn-loss.png)
*Mask R-CNN training loss graph.*

## Segment Anything Experiments

I also played around with [Meta's Segment Anything Model](https://segment-anything.com/) (SAM) using [`samgeo`](https://samgeo.gishub.org/) shortly after its mainstream release. This was a useful direction because SAM could generate object-like masks without the same fully supervised setup as the Mask R-CNN workflow. But it also surfaced a core issue: generic segmentation is not the same as ecological classification. A model can segment many reef objects while still not knowing which masks correspond to elkhorn coral.

As we reached the end of the project, I presumed that the most promising direction would likely combine the two approaches: use broad segmentation via SAM to propose candidate objects, then classify or filter those candidates with coral-specific training data via Faster R-CNN or Mask R-CNN.

## Takeaways

This project did not produce a production-ready coral monitoring model, but it did build a working geospatial deep learning pipeline:

- drone imagery to orthomosaic;
- hand-labeled coral training polygons;
- exported chips and masks;
- trained object detection and segmentation models;
- inference outputs that could be brought back into GIS;
- early experiments with foundation-model segmentation.

The main lesson was that automating coral mapping is feasible, but that there are several bottlenecks, including variable image quality, georeferencing, training-data design, annotation consistency, class balance, and how outputs will be checked by scientists and restoration teams.

For me, the project was a useful bridge between conservation science and applied machine learning. It showed how computer vision can help with environmental monitoring, while also making clear that field context and GIS workflows matter as much as the model itself.
