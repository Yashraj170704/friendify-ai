
# 3D Models for AI Assistant

This directory should contain the following 3D model files:

1. `stylized_male.glb` - A stylized male character model with facial animation capabilities
2. `stylized_female.glb` - A stylized female character model with facial animation capabilities
3. `robot_head.glb` - A futuristic robot head model with articulated jaw for speaking animations

## IMPORTANT NOTE

The AI Assistant is currently using a 2D image fallback as shown in the preview. To use a 3D model, you need to:

1. Obtain suitable 3D character models in GLB format
2. Place them in this directory with the exact filenames above
3. Set `modelLoadFailed` to `false` in src/components/ThreeDAvatar.tsx

## Getting 3D Models

You can obtain free or paid 3D models from various sources:
- SketchFab (https://sketchfab.com)
- TurboSquid (https://turbosquid.com)
- CGTrader (https://cgtrader.com)
- Free3D (https://free3d.com)

Look for models that:
1. Are in GLB format (or can be converted to GLB)
2. Have a low polygon count for web performance
3. Include basic facial animations if possible
4. Have appropriate licensing for your use case

## Current Default

The AI Assistant currently uses a stylized 2D image as the default appearance.
