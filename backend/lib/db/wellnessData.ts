export interface WellnessItem {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  mindful_benefit: string;
}

export const wellnessData: WellnessItem[] = [
  {
    id: "WELL-001",
    title: "Sacred Forest Mindful Retreat",
    category: "Retreat",
    price: 450,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    description: "An immersive 3-day sanctuary experience surrounded by ancient cedar trees. Designed for deep burnout recovery, guided daily forest bathing, silent meditation walks, and organic plant-based nourishment.",
    mindful_benefit: "Deep Burnout Recovery & Nervous System Reset",
  },
  {
    id: "WELL-002",
    title: "Deep Sleep & Botanical Aromatherapy Kit",
    category: "Aromatherapy",
    price: 65,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
    description: "A restorative bedtime ritual set featuring artisanal French lavender oil, wild chamomile pillow mist, and hand-poured soy candles. Promotes REM sleep quality, eases racing night thoughts, and lulls you into peaceful slumber.",
    mindful_benefit: "Restorative Sleep & Insomnia Relief",
  },
  {
    id: "WELL-003",
    title: "Holistic Stress Relief & Sound Bath Experience",
    category: "Spa Package",
    price: 180,
    rating: 4.95,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80",
    description: "A 90-minute restorative vibrational acoustic therapy session using 432Hz Tibetan crystal singing bowls, combined with warm volcanic stone massage and frankincense chakra alignment.",
    mindful_benefit: "Immediate Anxiety Reduction & Energetic Rebalancing",
  },
  {
    id: "WELL-004",
    title: "Organic Herbal Cellular Detox Elixir",
    category: "Supplements",
    price: 48,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    description: "A potent cold-extracted botanical tonic infused with milk thistle, dandelion root, wild elderberry, and ceremonial matcha. Gently flushes toxins, improves gut vitality, and restores natural energy levels.",
    mindful_benefit: "Cellular Rejuvenation & Vitality Boost",
  },
  {
    id: "WELL-005",
    title: "Radiance Glow Botanical Facial Serum",
    category: "Skincare",
    price: 85,
    rating: 4.85,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    description: "An ultra-nourishing organic skincare serum infused with cold-pressed rosehip seed, bakuchiol, and Blue Tansy oil. Hydrates deeply while soothing inflammation and protecting against environmental stress.",
    mindful_benefit: "Skin Barrier Repair & Mindful Self-Care",
  },
  {
    id: "WELL-006",
    title: "Zen Meditation & Breathwork Masterclass Package",
    category: "Retreat",
    price: 120,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    description: "A guided 4-week hybrid digital and workshop experience centered on Pranayama breathwork, vagus nerve stimulation, and mindful emotional release under master Zen practitioners.",
    mindful_benefit: "Vagus Nerve Activation & Emotional Clarity",
  },
  {
    id: "WELL-007",
    title: "Thermal Mineral Bath & Chakra Healing Ritual",
    category: "Spa Package",
    price: 210,
    rating: 4.88,
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    description: "Soak in natural geothermal mineral waters enriched with magnesium and Himalayan pink salts, followed by a personalized aura reading, hydrotherapy, and rose quartz facial massage.",
    mindful_benefit: "Muscle Tension Release & Emotional Grounding",
  },
  {
    id: "WELL-008",
    title: "Adaptogenic Ashwagandha & Mind Balance Blend",
    category: "Supplements",
    price: 52,
    rating: 4.75,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    description: "Organic KSM-66 Ashwagandha combined with Holy Basil (Tulsi) and Lion's Mane mushroom extract. Regulates cortisol response, sharpens focus, and calms chronic mental fatigue.",
    mindful_benefit: "Cortisol Regulation & Mental Focus",
  },
  {
    id: "WELL-009",
    title: "Eco-Bamboo Mindfulness Yoga & Grounding Mat Set",
    category: "Retreat",
    price: 95,
    rating: 4.92,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80",
    description: "A sustainable natural cork and organic bamboo rubber yoga mat bundled with a velvet meditation cushion, linen eye pillow, and a daily mindfulness journal.",
    mindful_benefit: "Somatic Body Connection & Daily Mindful Practice",
  },
  {
    id: "WELL-010",
    title: "Ocean Silence Coastal Wellness Sanctuary Retreat",
    category: "Retreat",
    price: 620,
    rating: 4.98,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    description: "A secluded oceanfront wellness haven featuring ocean-view yoga pavilions, salt therapy saunas, organic farm-to-table dining, and one-on-one holistic lifestyle coaching.",
    mindful_benefit: "Total Mind-Body Transformation & Spiritual Rejuvenation",
  },
];
