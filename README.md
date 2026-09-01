# CHIMERA — Project Page

Project page for **CHIMERA: Adaptive Cache Injection and Semantic Anchor Prompting for Zero-shot Image Morphing with Morphing-oriented Metrics** (arXiv 2026).

**Authors:** Dahyeon Kye\*, Jeahun Sung\*, Minkyu Jeon, Jihyong Oh† &nbsp; (\*equal contribution, †corresponding author)
**Affiliations:** Creative Vision and Multimedia Lab (CMLab), Chung-Ang University · Princeton University

📄 [arXiv](https://arxiv.org/abs/2512.07155)

## TL;DR

CHIMERA enables smooth and semantically consistent **zero-shot image morphing** between two images through two key components:

- **Adaptive Cache Injection (ACI)** — corrects the timestep mismatch between inversion and denoising and reinjects multi-scale cached diffusion features (low-frequency structure early, high-frequency detail later) to guide consistent transitions.
- **Semantic Anchor Prompting (SAP)** — injects a VLM-derived anchor prompt into early cross-attention layers to stabilize semantics and reduce drift for heterogeneous input pairs.

It also introduces **GLCS**, a new morphing-oriented metric for evaluating transition quality. CHIMERA is **training-free** and efficient, jointly improving smoothness, domain consistency, and perceptual quality over prior methods.


## Credits

Built from the [Academic Project Astro Template](https://github.com/RomanHauksson/academic-project-astro-template) by Roman Hauksson, adapted from Keunhong Park's [Nerfies](https://nerfies.github.io/) page. Licensed under [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).


## Citation

```bibtex
@article{kye2025chimera,
  title={CHIMERA: Adaptive Cache Injection and Semantic Anchor Prompting for Zero-shot Image Morphing with Morphing-oriented Metrics},
  author={Kye, Dahyeon and Sung, Jeahun and Jeon, Minkyu and Oh, Jihyong},
  journal={arXiv preprint arXiv:2512.07155},
  year={2025}
}
```