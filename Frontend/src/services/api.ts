export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:5050";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  lab_id: string;
  bio: string;
  created_at: string;
};

export type Achievement = {
  id: string;
  title: string;
  category: string;
  code: string;
  icon: string;
  desc: string;
  date: string;
  unlocked: boolean;
};

export type ActivityItem = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  created_at?: string;
};

export type QuizItem = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Experiment = {
  id: number;
  experiment: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  aim: string;
  theory: string;
  materials: string[];
  procedure: string[];
  precautions: string[];
  learningObjectives?: string[];
  result: string | Record<string, string>;
  quiz: QuizItem[];
  ai_faqs: FaqItem[];
};

export type ProgressData = {
  experiment_id: number;
  completed_sections: string[];
  lab_score: number;
  lab_time: number;
  mistakes: number;
  is_completed: boolean;
  last_updated?: string;
};

export type ProgressOverview = {
  progress: ProgressData[];
  summary: {
    total_experiments: number;
    completed_experiments: number;
    overall_percentage: number;
    average_lab_score: number;
  };
};

export type QuizResult = {
  id: string;
  experiment_id: number;
  score: number;
  total: number;
  percentage: number;
  created_at: string;
};

export type LabNote = {
  id: string;
  experiment_id: number;
  experiment_name: string;
  title: string;
  content: string;
  date: string;
};

/* ==================================================================
   OFFLINE FALLBACK DATASET (Guarantee 100% Reliability)
   ================================================================== */
export const FALLBACK_EXPERIMENTS: Experiment[] = [
  {
    id: 1,
    experiment: "DNA Extraction",
    category: "Molecular Biology",
    difficulty: "Beginner",
    estimatedTime: "15 mins",
    aim: "To extract DNA from biological cells (such as strawberries) and observe the white thread-like DNA precipitate with the naked eye.",
    theory: "DNA (Deoxyribonucleic Acid) is the hereditary material in organisms, residing inside the cell nucleus. Plant cells possess both a rigid cellulose wall and a phospholipid bilayer. During extraction: physical mashing breaks cell walls; detergent disrupts membranes; salt neutralizes negative charges so strands aggregate; cold alcohol causes DNA to precipitate out of the aqueous phase.",
    materials: [
      "Fresh biological sample (strawberries)",
      "Dishwashing liquid (detergent)",
      "Table salt (NaCl)",
      "Distilled water",
      "Funnel & filter paper",
      "Glass beaker & stir stick",
      "Test tube",
      "Ice-cold 95% Ethanol or Isopropyl alcohol",
      "Glass spooling rod"
    ],
    procedure: [
      "Crush strawberry sample in a container into a smooth puree.",
      "Prepare extraction buffer with water, dishwashing detergent, and salt.",
      "Add buffer to sample and stir gently without frothing.",
      "Filter the mixture through filter paper into a beaker.",
      "Collect filtrate into a clean test tube.",
      "Slowly pour chilled alcohol down the side of the test tube.",
      "Observe cloudy white DNA strands precipitate at the interface.",
      "Spool out the isolated DNA using a glass rod."
    ],
    precautions: [
      "Always use ice-cold alcohol to maximize precipitation yield.",
      "Avoid vigorous shaking to prevent mechanical shearing of long DNA strands.",
      "Pour alcohol gently along the wall of the tilted tube to avoid mixing phases.",
      "Filter thoroughly to avoid contaminating the DNA with cellular debris."
    ],
    learningObjectives: [
      "Understand cellular lysis via detergent disruption of phospholipid bilayers.",
      "Explain the role of Na+ ions in charge neutralization.",
      "Demonstrate precipitation of nucleic acids via polarity shifts in cold ethanol."
    ],
    result: "White, viscous, thread-like DNA strands precipitate at the interface between the aqueous filtrate and the alcohol layer.",
    quiz: [
      {
        question: "What is the primary role of detergent in the DNA extraction procedure?",
        options: [
          "To dissolve the lipid bilayers of cell and nuclear membranes",
          "To synthesize new complementary DNA strands",
          "To dye the DNA precipitate white",
          "To change the pH of the solution to acidic"
        ],
        answer: "To dissolve the lipid bilayers of cell and nuclear membranes",
        explanation: "Detergents contain amphipathic surfactants that solubilize the phospholipid membranes of the cell and nucleus, liberating intracellular DNA."
      },
      {
        question: "Why is sodium chloride (salt) added during the extraction process?",
        options: [
          "To neutralize the negative charges of DNA and help strands aggregate",
          "To prevent the biological sample from spoiling",
          "To speed up the evaporation of ethanol",
          "To digest the ribosomal RNA"
        ],
        answer: "To neutralize the negative charges of DNA and help strands aggregate",
        explanation: "Na+ ions neutralize the negatively charged phosphate backbone of DNA molecules, reducing electrostatic repulsion so the strands can aggregate and precipitate."
      },
      {
        question: "Why must the alcohol used for precipitation be ice-cold?",
        options: [
          "DNA is less soluble in cold alcohol, maximizing yield and precipitation speed",
          "To kill any lingering bacteria in the strawberry",
          "Cold alcohol increases the temperature of the reaction",
          "Warm alcohol would freeze the DNA strands instantly"
        ],
        answer: "DNA is less soluble in cold alcohol, maximizing yield and precipitation speed",
        explanation: "DNA is polar and insoluble in cold ethanol. Chilling the alcohol decreases nucleic acid solubility and preserves DNA integrity by inhibiting DNase enzymes."
      },
      {
        question: "Why are strawberries especially popular for classroom DNA extraction?",
        options: [
          "They are octoploid (8 copies of each chromosome), providing abundant DNA",
          "They do not have cell membranes",
          "Their DNA is colored bright red",
          "Their DNA does not require alcohol to precipitate"
        ],
        answer: "They are octoploid (8 copies of each chromosome), providing abundant DNA",
        explanation: "Cultivated strawberries (Fragaria ananassa) are octoploid (8 sets of chromosomes), meaning each cell contains a very large amount of genomic DNA compared to diploid cells."
      },
      {
        question: "Where does the DNA precipitate appear in the test tube?",
        options: [
          "At the interface between the aqueous filtrate and the upper alcohol layer",
          "At the very bottom as a dense rock-like pellet",
          "Floating as gas bubbles in the air above the tube",
          "Dissolved invisibly into the detergent"
        ],
        answer: "At the interface between the aqueous filtrate and the upper alcohol layer",
        explanation: "Because ethanol is less dense than the aqueous extract, it floats on top. DNA precipitates at the boundary (interface) between the two liquid phases."
      }
    ],
    ai_faqs: [
      {
        question: "Why is detergent necessary?",
        answer: "Detergent contains surfactants that break down the lipid membranes of the cell and the nucleus, allowing the DNA to escape into the solution."
      },
      {
        question: "Why is alcohol used in DNA extraction?",
        answer: "DNA is soluble in water due to its polar phosphate backbone, but it is insoluble in alcohol (especially cold ethanol). Adding alcohol forces DNA to precipitate out of solution."
      },
      {
        question: "What happens if the alcohol is warm?",
        answer: "If alcohol is warm, DNA remains more soluble, resulting in significantly lower yield or failure to form visible strands, and cellular DNases might degrade the DNA."
      },
      {
        question: "Why does the extracted DNA appear as white slimy threads?",
        answer: "When millions of microscopic DNA molecules precipitate and clump together, their macromolecular structures scatter visible light, appearing as white mucus-like or thread-like strands."
      }
    ]
  },
  {
    id: 2,
    experiment: "Polymerase Chain Reaction (PCR)",
    category: "Molecular Biology",
    difficulty: "Intermediate",
    estimatedTime: "20 mins",
    aim: "To amplify a specific target DNA sequence by millions of times in vitro using the Polymerase Chain Reaction (PCR) technique.",
    theory: "PCR cycles repeatedly through three temperature steps: (1) Denaturation at 95°C separates double-stranded DNA into single strands; (2) Annealing at 55°C allows forward and reverse primers to bind complementary target sequences; (3) Extension at 72°C enables heat-tolerant Taq polymerase to synthesize new DNA strands using dNTPs.",
    materials: [
      "Template DNA sample",
      "Forward & Reverse Oligonucleotide Primers",
      "Taq DNA Polymerase",
      "dNTPs Master Mix (dATP, dCTP, dGTP, dTTP)",
      "10X PCR Reaction Buffer with MgCl2",
      "Nuclease-free sterile water",
      "0.2 mL thin-walled PCR tubes",
      "Micropipette and aerosol-barrier tips",
      "Programmable Thermal Cycler (PCR Machine)"
    ],
    procedure: [
      "Assemble reaction mixture: Buffer, dNTPs, Primers, Template, and Taq Polymerase.",
      "Mix gently and briefly centrifuge PCR tube.",
      "Place tube into thermal cycler block and seal heated lid.",
      "Denaturation: 95°C for 30s to separate template strands.",
      "Annealing: 55°C for 30s to bind primers.",
      "Extension: 72°C for 60s for Taq synthesis.",
      "Repeat for 30 thermal cycles.",
      "Analyze amplified amplicons via gel electrophoresis."
    ],
    precautions: [
      "Keep enzyme, primers, and nucleotides on ice prior to thermal cycling.",
      "Use aerosol-resistant pipette tips to avoid cross-contamination.",
      "Seal tube caps tightly to prevent reaction evaporation under high temperatures."
    ],
    learningObjectives: [
      "Understand the biochemical principles of in vitro DNA replication.",
      "Identify the 3 core thermal phases: Denaturation, Annealing, Extension.",
      "Calculate exponential amplicon amplification (2^n)."
    ],
    result: "Target DNA sequence is successfully amplified through 30 thermal cycles, yielding over 1 billion identical copies ready for analysis.",
    quiz: [
      {
        question: "Why is Taq polymerase specifically used in PCR instead of human or bacterial DNA polymerase?",
        options: [
          "It is thermostable and resists denaturation at 95°C",
          "It is much cheaper to manufacture in the laboratory",
          "It synthesizes DNA in both 5' to 3' and 3' to 5' directions simultaneously",
          "It does not require primers to start synthesis"
        ],
        answer: "It is thermostable and resists denaturation at 95°C",
        explanation: "Taq polymerase is derived from the thermophilic bacterium Thermus aquaticus found in hot springs; it remains stable and enzymatically active even through repeated cycles at 95°C."
      },
      {
        question: "What occurs during the Denaturation step (typically 94–98°C)?",
        options: [
          "Hydrogen bonds break, separating double-stranded DNA into single strands",
          "Primers bind to the template DNA",
          "Taq polymerase adds nucleotides to the 3' end",
          "The PCR tube melts to release the reaction mixture"
        ],
        answer: "Hydrogen bonds break, separating double-stranded DNA into single strands",
        explanation: "High thermal energy disrupts the hydrogen bonds between complementary base pairs, unwinding the double helix into single strands."
      },
      {
        question: "What is the purpose of primers in the PCR reaction?",
        options: [
          "They provide a free 3'-OH group and define the exact target region to be amplified",
          "They provide energy for the polymerase enzyme",
          "They degrade unwanted host DNA",
          "They stain the amplified DNA blue"
        ],
        answer: "They provide a free 3'-OH group and define the exact target region to be amplified",
        explanation: "DNA polymerases cannot initiate synthesis de novo; they require a pre-existing 3'-OH group provided by a primer annealed specifically to the template boundary."
      },
      {
        question: "What is the optimal extension temperature for Taq DNA Polymerase?",
        options: ["72°C", "37°C", "55°C", "95°C"],
        answer: "72°C",
        explanation: "Taq polymerase exhibits maximum catalytic efficiency around 72°C, extending approximately 1,000 base pairs per minute."
      },
      {
        question: "How many copies of target DNA are theoretically produced from 1 template after 30 cycles?",
        options: [
          "Over 1 billion copies (2^30)",
          "30 copies",
          "60 copies",
          "1,000 copies"
        ],
        answer: "Over 1 billion copies (2^30)",
        explanation: "Because DNA doubles with every complete thermal cycle, after n cycles the yield is 2^n. For n = 30, 2^30 = 1,073,741,824 copies."
      }
    ],
    ai_faqs: [
      {
        question: "Why is Taq polymerase used?",
        answer: "Taq polymerase comes from Thermus aquaticus and can withstand repeated denaturation steps at 95°C without unfolding."
      },
      {
        question: "How many copies of DNA are produced in PCR?",
        answer: "PCR amplifies exponentially (2^n). After 30 cycles, one DNA molecule yields over 1,000,000,000 copies."
      },
      {
        question: "What happens during denaturation?",
        answer: "High thermal energy unzips the hydrogen bonds holding the two complementary strands together, creating single-stranded templates."
      }
    ]
  },
  {
    id: 3,
    experiment: "Gram Staining",
    category: "Microbiology",
    difficulty: "Beginner",
    estimatedTime: "15 mins",
    aim: "To differentiate bacterial species into Gram-positive and Gram-negative groups based on cell wall peptidoglycan thickness.",
    theory: "Gram-positive bacteria possess a thick peptidoglycan wall that traps the crystal violet-iodine (CV-I) complex when dehydrated by alcohol, retaining a deep purple stain. Gram-negative bacteria have a thin peptidoglycan layer and an outer lipid membrane that dissolves in alcohol, washing out the CV-I complex so cells counterstain pink with safranin.",
    materials: [
      "Mixed bacterial culture (S. aureus and E. coli)",
      "Glass microscope slides",
      "Inoculating loop & Bunsen burner",
      "Crystal Violet (Primary stain)",
      "Gram's Iodine (Mordant)",
      "95% Ethanol (Decolorizer)",
      "Safranin (Counterstain)",
      "Distilled water wash bottle",
      "Light microscope with 100X oil immersion"
    ],
    procedure: [
      "Prepare a thin bacterial smear on a clean glass slide.",
      "Heat-fix the smear gently over the Bunsen flame.",
      "Apply Crystal Violet primary stain for 60 seconds, then rinse with water.",
      "Apply Gram's Iodine mordant for 60 seconds, then rinse.",
      "Decolorize with 95% ethanol for 10–15 seconds, then wash immediately with water.",
      "Apply Safranin counterstain for 45 seconds, rinse, and blot dry.",
      "Observe under microscope at 100X oil immersion."
    ],
    precautions: [
      "Do not overheat the smear during heat fixation.",
      "Strictly limit decolorization to 10–15 seconds to prevent false-negative results.",
      "Use fresh cultures (<24 hours old) for accurate cell wall retention."
    ],
    learningObjectives: [
      "Differentiate bacterial cell wall structures.",
      "Identify Gram-positive purple cocci and Gram-negative pink bacilli under microscopy.",
      "Master differential staining techniques."
    ],
    result: {
      gram_positive: "Staphylococcus aureus appear as violet/purple cocci in clusters.",
      gram_negative: "Escherichia coli appear as pink/red rod-shaped bacilli."
    },
    quiz: [
      {
        question: "What is the primary role of Gram's Iodine in Gram staining?",
        options: [
          "It acts as a mordant, forming an insoluble Crystal Violet-Iodine complex inside the cell wall",
          "It bleaches the bacterial cells so counterstain can bind",
          "It dissolves the thick peptidoglycan layer of Gram-positive cells",
          "It serves as the red counterstain"
        ],
        answer: "It acts as a mordant, forming an insoluble Crystal Violet-Iodine complex inside the cell wall",
        explanation: "Gram's iodine binds with crystal violet to form a bulky CV-I precipitate inside the peptidoglycan matrix, preventing it from being easily washed out of thick cell walls."
      },
      {
        question: "Why do Gram-positive bacteria appear purple after the full procedure?",
        options: [
          "Their thick peptidoglycan wall dehydrates in alcohol, trapping the purple CV-I complex",
          "They absorb safranin much more strongly than crystal violet",
          "They have an outer membrane made of purple lipopolysaccharides",
          "They naturally produce purple pigment inside their cytoplasm"
        ],
        answer: "Their thick peptidoglycan wall dehydrates in alcohol, trapping the purple CV-I complex",
        explanation: "Alcohol dehydrates the thick peptidoglycan layer, shrinking pore spaces and firmly trapping the purple crystal violet-iodine complex."
      },
      {
        question: "What color do Gram-negative bacteria appear at the end of a successful Gram stain?",
        options: ["Pink / Red", "Deep violet / Purple", "Colorless / Transparent", "Bright green"],
        answer: "Pink / Red",
        explanation: "Gram-negative cells lose their purple primary stain during decolorization and take up the pink safranin counterstain."
      },
      {
        question: "What happens if you leave the alcohol decolorizer on the slide for several minutes?",
        options: [
          "Both Gram-positive and Gram-negative bacteria will be decolorized and appear pink",
          "All bacteria will turn permanently dark purple",
          "The bacteria will dissolve completely and vanish from the slide",
          "The slide will become fluorescent under UV light"
        ],
        answer: "Both Gram-positive and Gram-negative bacteria will be decolorized and appear pink",
        explanation: "Over-decolorization washes out the CV-I complex even from thick Gram-positive walls, causing all cells to absorb safranin and falsely appear pink."
      },
      {
        question: "Why is heat-fixation necessary before applying the staining reagents?",
        options: [
          "It kills bacteria and adheres them securely to the glass slide so they don't wash off",
          "It activates bacterial enzymes to absorb the chemical dyes",
          "It bleaches bacterial capsules",
          "It cools down the glass slide to room temperature"
        ],
        answer: "It kills bacteria and adheres them securely to the glass slide so they don't wash off",
        explanation: "Gentle heat coagulates bacterial surface proteins, adhering the organisms firmly to the slide and killing them for safer handling."
      }
    ],
    ai_faqs: [
      {
        question: "Why do Gram-positive bacteria remain purple?",
        answer: "Their thick peptidoglycan wall traps the large Crystal Violet-Iodine complexes when dehydrated by alcohol."
      },
      {
        question: "What is the role of Gram's iodine?",
        answer: "Gram's iodine acts as a mordant: it complexes with crystal violet to form a larger CV-I molecule that is harder to wash out."
      },
      {
        question: "Why do Gram-negative bacteria appear pink?",
        answer: "Their thin peptidoglycan layer and outer lipid membrane allow the purple dye to wash away in alcohol, leaving them clear until stained pink by safranin."
      }
    ]
  },
  {
    id: 4,
    experiment: "Gel Electrophoresis",
    category: "Molecular Biology",
    difficulty: "Intermediate",
    estimatedTime: "20 mins",
    aim: "To separate, visualize, and determine the size of DNA fragments using agarose gel electrophoresis under an electric field.",
    theory: "Because the sugar-phosphate backbone of DNA carries a uniform negative charge at neutral pH, DNA fragments migrate toward the positive anode (+) when subjected to an electric field. The porous agarose matrix acts as a molecular sieve: smaller fragments navigate pores faster and travel further than larger fragments. A DNA ladder with known fragment sizes provides a calibration standard.",
    materials: [
      "Agarose powder",
      "1X TAE electrophoresis running buffer",
      "Gel casting tray, dams, and well comb",
      "Horizontal electrophoresis tank & power supply (100V)",
      "DNA Ladder (100–1000 bp)",
      "DNA test samples & 6X Loading dye",
      "Fluorescent DNA stain (GelGreen / Ethidium bromide)",
      "Precision micropipette & tips",
      "UV / Blue-light transilluminator"
    ],
    procedure: [
      "Dissolve agarose in 1X TAE buffer by heating in microwave until clear.",
      "Add fluorescent stain and pour into casting tray with comb; allow to polymerize.",
      "Remove comb and submerge gel in electrophoresis tank with 1X TAE buffer.",
      "Load DNA ladder into Well 1 using micropipette.",
      "Load DNA Sample 1 into Well 2 and DNA Sample 2 into Well 3.",
      "Connect electrodes (Run to Red) and apply 100 Volts.",
      "Observe blue tracking dye migration toward the positive anode.",
      "Turn off power, place gel on UV transilluminator, and photograph fluorescent DNA bands."
    ],
    precautions: [
      "Always connect electrodes so DNA runs to the positive red anode ('Run to Red').",
      "Do not puncture the bottom of the gel wells when pipetting samples.",
      "Wear UV protection glasses when visualizing gels under transillumination."
    ],
    learningObjectives: [
      "Explain the migration of negatively charged DNA in an electric field.",
      "Demonstrate micropipetting and gel loading.",
      "Determine fragment sizes by comparing with a standardized DNA ladder."
    ],
    result: "Sharp fluorescent bands are observed under UV light. Ladder bands appear at 1000, 750, 500, and 250 bp. Sample 1 has a single band at 500 bp, while Sample 2 has bands at 750 bp and 250 bp.",
    quiz: [
      {
        question: "Toward which electrode does DNA migrate during gel electrophoresis, and why?",
        options: [
          "Toward the positive anode (+), because the phosphate backbone gives DNA a negative charge",
          "Toward the negative cathode (-), because nitrogenous bases are positively charged",
          "Toward whichever electrode has higher water temperature",
          "DNA stays stationary while the agarose gel moves"
        ],
        answer: "Toward the positive anode (+), because the phosphate backbone gives DNA a negative charge",
        explanation: "At neutral pH, each phosphate group in DNA's backbone carries a negative charge. Opposites attract, so DNA migrates toward the positively charged anode (+ / red electrode)."
      },
      {
        question: "Which DNA fragments migrate fastest and travel farthest through the agarose gel?",
        options: [
          "Smaller DNA fragments, because they maneuver easily through the gel pores",
          "Larger DNA fragments, because they have more electric charge",
          "Circular plasmids always move faster than any linear fragments",
          "All fragments move at the exact same velocity"
        ],
        answer: "Smaller DNA fragments, because they maneuver easily through the gel pores",
        explanation: "The agarose matrix acts like a sieve. Smaller fragments experience less frictional resistance through the pores and travel further in a given time than bulky high-molecular-weight fragments."
      },
      {
        question: "What is the primary function of a DNA ladder loaded in the first well?",
        options: [
          "To provide reference bands of known sizes to estimate the base-pair length of experimental samples",
          "To clean out leftover bacteria from the gel wells",
          "To provide extra electrical conductance across the chamber",
          "To stop the power supply when the run is finished"
        ],
        answer: "To provide reference bands of known sizes to estimate the base-pair length of experimental samples",
        explanation: "A DNA ladder contains pre-measured DNA fragments of standardized lengths against which the size of unknown sample bands can be determined."
      },
      {
        question: "Why is glycerol included in the sample loading dye?",
        options: [
          "To increase sample density so it sinks to the bottom of the well instead of diffusing into buffer",
          "To chemically bind and dissolve the agarose",
          "To serve as food for the DNA molecules",
          "To prevent the power supply from short-circuiting"
        ],
        answer: "To increase sample density so it sinks to the bottom of the well instead of diffusing into buffer",
        explanation: "Glycerol increases the density of the sample solution relative to the surrounding running buffer, causing the sample to sink neatly into the submarine well."
      },
      {
        question: "How are DNA bands visualized after the electrophoresis run?",
        options: [
          "Using fluorescent dyes that intercalate between DNA base pairs and glow under UV/blue light",
          "By smelling the ozone produced by the electrophoresis chamber",
          "By holding the gel up to regular sunlight with a magnifying glass",
          "DNA bands are naturally colored bright red and need no stain"
        ],
        answer: "Using fluorescent dyes that intercalate between DNA base pairs and glow under UV/blue light",
        explanation: "DNA itself is transparent in visible light. Fluorescent dyes slip between stacked bases and emit bright visible light when excited by UV or blue light."
      }
    ],
    ai_faqs: [
      {
        question: "Why do DNA fragments move through the gel?",
        answer: "DNA molecules have a negatively charged phosphate backbone. In an electrical field, they are repelled by the negative cathode and attracted toward the positive anode."
      },
      {
        question: "Why do smaller fragments move faster than larger ones?",
        answer: "The agarose gel forms a microscopic three-dimensional mesh of pores. Smaller DNA molecules navigate through the matrix with less steric hindrance, migrating faster and farther."
      },
      {
        question: "What happens if you connect the electrodes backward?",
        answer: "If polarity is inverted, the negatively charged DNA will run backward out of the top of the wells and be lost in the buffer tank."
      }
    ]
  },
  {
    id: 5,
    experiment: "ELISA",
    category: "Immunology",
    difficulty: "Advanced",
    estimatedTime: "25 mins",
    aim: "To detect and quantify the presence of a specific antigen or antibody in a clinical patient sample using an indirect Enzyme-Linked Immunosorbent Assay (ELISA).",
    theory: "In an indirect ELISA, target antigen is immobilized in microplate wells. Blocking buffer (BSA) coats vacant plastic sites to prevent non-specific binding. Patient serum containing primary antibodies is added; specific antibodies bind the antigen. An enzyme-linked secondary antibody (HRP-conjugated) then binds the primary antibody. After rigorous washing, TMB substrate is added, turning blue upon HRP oxidation. Stop solution (H2SO4) shifts the color to yellow, and optical density at 450 nm (OD450) is measured to quantify analyte concentration.",
    materials: [
      "96-well polystyrene microplate",
      "Target Antigen coating solution",
      "1% BSA Blocking buffer in PBS",
      "PBST wash buffer",
      "Positive, Negative, and Patient serum samples",
      "Primary detection antibody",
      "HRP-conjugated secondary antibody",
      "TMB chromogenic liquid substrate",
      "1 M H2SO4 Stop solution",
      "Precision micropipettes & tips",
      "Microplate Spectrophotometer Reader (450 nm)"
    ],
    procedure: [
      "Coat microplate wells with target antigen and incubate.",
      "Wash wells 3 times with PBST to remove unbound antigen.",
      "Add 1% BSA blocking buffer to block non-specific binding sites.",
      "Wash wells with PBST.",
      "Add Negative Control, Positive Control, and Patient Sample into respective wells.",
      "Wash thoroughly 4 times to eliminate unbound antibodies.",
      "Add HRP-conjugated secondary antibody and incubate in dark.",
      "Wash 4 times with PBST to remove residual enzyme conjugate.",
      "Add TMB chromogenic substrate; observe catalytic blue color change.",
      "Add 1 M H2SO4 stop solution; notice immediate color shift to yellow.",
      "Measure absorbance at 450 nm in the microplate reader."
    ],
    precautions: [
      "Perform thorough washing between steps; inadequate washing causes high background and false positives.",
      "Keep TMB substrate shielded from light before use.",
      "Handle 1 M sulfuric acid stop solution with care as it is corrosive."
    ],
    learningObjectives: [
      "Understand enzyme-linked antibody recognition in immunology.",
      "Explain the biochemical function of blocking buffer.",
      "Quantify analyte concentration using optical density (OD450)."
    ],
    result: {
      blank: "0.04 OD (Baseline)",
      negative_control: "0.08 OD (Negative)",
      positive_control: "1.84 OD (Strong Positive)",
      patient_sample: "1.42 OD (Positive for target antibodies)"
    },
    quiz: [
      {
        question: "What is the primary function of adding a Blocking Buffer (such as BSA)?",
        options: [
          "To bind to unoccupied plastic sites so antibodies don't attach non-specifically",
          "To break the covalent bonds of the antigen",
          "To speed up the color conversion of TMB substrate",
          "To kill any living viruses present in the well"
        ],
        answer: "To bind to unoccupied plastic sites so antibodies don't attach non-specifically",
        explanation: "Polystyrene binds proteins non-specifically. Bovine Serum Albumin (BSA) saturates open plastic surface areas, ensuring antibodies only adhere if they specifically bind their target antigen."
      },
      {
        question: "What happens if the wash steps between antibody additions are skipped or done poorly?",
        options: [
          "Unbound enzyme-linked antibodies remain, leading to false-positive color in all wells",
          "The microplate will crack under pressure",
          "The reaction will turn completely colorless permanently",
          "Antibodies will precipitate into crystals"
        ],
        answer: "Unbound enzyme-linked antibodies remain, leading to false-positive color in all wells",
        explanation: "If residual secondary antibody is not washed away, its conjugated HRP enzyme will convert TMB to blue regardless of whether antigen was present, creating widespread false positives."
      },
      {
        question: "What enzyme is commonly conjugated to the secondary antibody in ELISA?",
        options: [
          "Horseradish Peroxidase (HRP)",
          "DNA Polymerase",
          "Amylase",
          "Cellulase"
        ],
        answer: "Horseradish Peroxidase (HRP)",
        explanation: "Horseradish Peroxidase (HRP) or Alkaline Phosphatase (AP) are widely used enzyme reporters that catalytically convert chromogenic substrates into easily measurable colored products."
      },
      {
        question: "Why does adding Stop Solution (H2SO4) change the solution color from blue to yellow?",
        options: [
          "Acid lowers pH, protonating the diimine oxidized TMB and stopping HRP activity",
          "Sulfuric acid bleaches the primary antibody",
          "The blue dye evaporates when heated by acid",
          "H2SO4 destroys the plastic wells"
        ],
        answer: "Acid lowers pH, protonating the diimine oxidized TMB and stopping HRP activity",
        explanation: "Sulfuric acid denatures the HRP enzyme (stopping catalysis) and protonates the oxidized TMB dye product, causing an optical shift that absorbs at 450 nm (yellow)."
      },
      {
        question: "At what wavelength is absorbance typically measured after adding stop solution in a TMB ELISA?",
        options: ["450 nm", "260 nm", "600 nm", "850 nm"],
        answer: "450 nm",
        explanation: "The protonated, stopped yellow product of TMB has a sharp absorbance peak at 450 nm, read with a standard microplate spectrophotometer."
      }
    ],
    ai_faqs: [
      {
        question: "Why is washing critical in ELISA?",
        answer: "Washing removes unbound antigens and antibodies. If unbound enzyme-linked antibodies remain in the wells, they will react with substrate and create high non-specific background or false positives."
      },
      {
        question: "What is the role of the secondary antibody?",
        answer: "The secondary antibody recognizes the Fc region of the primary antibody and carries an enzyme (like HRP) that produces the detectable colorimetric signal."
      },
      {
        question: "What happens when stop solution is added?",
        answer: "Sulfuric acid denatures HRP, stopping the enzymatic reaction, and changes the blue color to yellow, which is measured at 450 nm."
      }
    ]
  }
];

// In-memory runtime state for offline/demo operation
let offlineProgress: Record<number, ProgressData> = {
  1: {
    experiment_id: 1,
    completed_sections: ["Aim", "Theory", "Materials", "Procedure"],
    lab_score: 85,
    lab_time: 210,
    mistakes: 0,
    is_completed: false
  },
  2: {
    experiment_id: 2,
    completed_sections: ["Aim", "Theory"],
    lab_score: 0,
    lab_time: 0,
    mistakes: 0,
    is_completed: false
  },
  3: {
    experiment_id: 3,
    completed_sections: [],
    lab_score: 0,
    lab_time: 0,
    mistakes: 0,
    is_completed: false
  },
  4: {
    experiment_id: 4,
    completed_sections: [],
    lab_score: 0,
    lab_time: 0,
    mistakes: 0,
    is_completed: false
  },
  5: {
    experiment_id: 5,
    completed_sections: [],
    lab_score: 0,
    lab_time: 0,
    mistakes: 0,
    is_completed: false
  }
};

let offlineQuizResults: QuizResult[] = [
  {
    id: "q-1",
    experiment_id: 1,
    score: 5,
    total: 5,
    percentage: 100,
    created_at: new Date().toISOString()
  }
];

let offlineNotes: LabNote[] = [
  {
    id: "n-1",
    experiment_id: 1,
    experiment_name: "DNA Extraction",
    title: "Chilled Ethanol Observation",
    content: "Noticeable cloud of white thread-like precipitate formed almost instantly at the alcohol-water interface. Spooling with glass rod was very clean.",
    date: "Sep 26, 2026"
  },
  {
    id: "n-2",
    experiment_id: 2,
    experiment_name: "PCR",
    title: "Thermal Cycling Parameters",
    content: "Initial denaturation at 95°C followed by 30 cycles (95°C 30s, 55°C 30s, 72°C 60s). Taq polymerase maintained high activity.",
    date: "Sep 26, 2026"
  }
];

/* ==================================================================
   AUTH & TOKEN MANAGEMENT
   ================================================================== */
let inMemoryToken: string | null = null;
let currentCachedUser: User | null = {
  id: "user-iris-danica",
  name: "Iris Danica",
  email: "demo@labsphere.ai",
  role: "Student Biologist & Researcher",
  institution: "School of Life Sciences & Bio-Engineering",
  lab_id: "LS-2026-BIO-8941",
  bio: "Undergraduate researcher concentrating on recombinant DNA technology, PCR diagnostic assays, microplate spectrophotometry, and virtual laboratory simulation methodologies.",
  created_at: "2026-09-01T08:00:00.000Z"
};

export function getAuthToken(): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return window.localStorage.getItem("labsphere_auth_token") || inMemoryToken;
    } catch {
      return inMemoryToken;
    }
  }
  return inMemoryToken;
}

export function setAuthToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem("labsphere_auth_token", token);
    } catch {
      // ignore
    }
  }
}

export function removeAuthToken(): void {
  inMemoryToken = null;
  currentCachedUser = null;
  offlineNotes = [];
  offlineProgress = {};
  offlineQuizResults = [];
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem("labsphere_auth_token");
      window.localStorage.removeItem("labsphere_cached_user");
    } catch {
      // ignore
    }
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  confirm_password?: string;
  institution?: string;
}): Promise<{ user: User; token: string }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Registration failed.");
    }
    setAuthToken(json.token);
    currentCachedUser = json.user;
    return { user: json.user, token: json.token };
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch")) {
      throw err;
    }
    // Offline simulation
    const simulatedUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "Student Biologist",
      institution: data.institution || "Biotechnology Institute",
      lab_id: `LS-2026-BIO-${Math.floor(1000 + Math.random() * 9000)}`,
      bio: "Enthusiastic virtual biotechnology student exploring molecular biology, immunology, and genetic assays.",
      created_at: new Date().toISOString(),
    };
    const simulatedToken = `offline-token-${Date.now()}`;
    setAuthToken(simulatedToken);
    currentCachedUser = simulatedUser;
    return { user: simulatedUser, token: simulatedToken };
  }
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Invalid email or password.");
    }
    setAuthToken(json.token);
    currentCachedUser = json.user;
    return { user: json.user, token: json.token };
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch")) {
      throw err;
    }
    // Offline demo fallback
    const simulatedUser: User = {
      id: "user-iris-danica",
      name: data.email.split("@")[0].replace(".", " "),
      email: data.email,
      role: "Student Biologist & Researcher",
      institution: "School of Life Sciences & Bio-Engineering",
      lab_id: "LS-2026-BIO-8941",
      bio: "Undergraduate researcher concentrating on recombinant DNA technology, PCR diagnostic assays, microplate spectrophotometry, and virtual laboratory simulation methodologies.",
      created_at: "2026-09-01T08:00:00.000Z",
    };
    const simulatedToken = `demo-token-${Date.now()}`;
    setAuthToken(simulatedToken);
    currentCachedUser = simulatedUser;
    return { user: simulatedUser, token: simulatedToken };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch {
    // offline
  } finally {
    removeAuthToken();
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.user) {
        currentCachedUser = json.user;
        return json.user;
      }
    }
  } catch {
    // offline
  }
  return currentCachedUser;
}

export async function updateProfile(data: {
  name?: string;
  institution?: string;
  bio?: string;
  role?: string;
}): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.user) {
        currentCachedUser = json.user;
        return json.user;
      }
    }
  } catch {
    // offline
  }
  if (currentCachedUser) {
    currentCachedUser = { ...currentCachedUser, ...data };
    return currentCachedUser;
  }
  return null;
}

export async function forgotPassword(email: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    return json.reset_token || "simulated-reset-token-2026";
  } catch {
    return "simulated-reset-token-2026";
  }
}

export async function resetPassword(data: {
  token: string;
  new_password: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Password reset failed.");
  }
}

export async function getAchievements(): Promise<Achievement[]> {
  try {
    const res = await fetch(`${API_URL}/api/achievements`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.achievements)) {
        return json.achievements;
      }
    }
  } catch {
    // fallback
  }

  // Fallback achievements based on local progress
  const completedCount = Object.values(offlineProgress).filter(
    (p) => p.is_completed || p.completed_sections.length >= 7
  ).length;

  return [
    {
      id: "cert-dna",
      title: "DNA Isolation Specialist",
      category: "Molecular Biology",
      date: "Sep 2026",
      code: "LS-DNA-9921",
      icon: "🧬",
      desc: "Demonstrated cellular lysis via detergent disruption, charge neutralization via NaCl, and cold ethanol precipitation with zero procedural errors.",
      unlocked: offlineProgress[1]?.is_completed || false,
    },
    {
      id: "cert-pcr",
      title: "PCR Master Technician",
      category: "Molecular Diagnostics",
      date: "Sep 2026",
      code: "LS-PCR-8412",
      icon: "⚡",
      desc: "Successfully programmed 3-stage thermal cycling kinetics (95°C denaturation, 55°C annealing, 72°C extension) across 30 exponential cycles.",
      unlocked: offlineProgress[2]?.is_completed || false,
    },
    {
      id: "cert-gram",
      title: "Gram Stain Microscopist",
      category: "Microbiology",
      date: "Sep 2026",
      code: "LS-MIC-7390",
      icon: "🔬",
      desc: "Mastered heat fixation, crystal violet-iodine mordant retention, ethanol decolorization, and differential 1000X oil immersion microscopy.",
      unlocked: offlineProgress[3]?.is_completed || false,
    },
    {
      id: "cert-gel",
      title: "Electrophoresis Analyst",
      category: "Biophysical Chemistry",
      date: "Sep 2026",
      code: "LS-GEL-4198",
      icon: "🧪",
      desc: "Expertly cast agarose matrix, loaded DNA ladder and sample wells without puncturing, and resolved molecular bands under 302nm UV transillumination.",
      unlocked: offlineProgress[4]?.is_completed || false,
    },
    {
      id: "cert-elisa",
      title: "ELISA Immunoassay Expert",
      category: "Immunology",
      date: "Sep 2026",
      code: "LS-ELI-3820",
      icon: "🧫",
      desc: "Executed indirect microplate enzyme-linked immunosorbent assay with chromogenic TMB substrate and 450nm spectrophotometric optical density quantification.",
      unlocked: offlineProgress[5]?.is_completed || false,
    },
    {
      id: "cert-safety",
      title: "Biosafety Level 1 (BSL-1)",
      category: "Laboratory Safety",
      date: "Sep 2026",
      code: "LS-BSL-1004",
      icon: "🛡",
      desc: "Full adherence to personal protective equipment (PPE), chemical spill protocols, ethanol flammability precautions, and hazardous waste disposal.",
      unlocked: completedCount >= 3,
    },
  ];
}

export async function getActivity(): Promise<ActivityItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/activity`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.activity)) {
        return json.activity;
      }
    }
  } catch {
    // fallback
  }

  return [
    {
      id: "act-1",
      icon: "🧫",
      title: "Completed ELISA Immunoassay Simulation",
      time: "25 minutes ago",
      detail: "Scored 100% with OD450 reading of 1.482. No cross-contamination.",
    },
    {
      id: "act-2",
      icon: "🧪",
      title: "Gel Electrophoresis Band Analysis Logged",
      time: "2 hours ago",
      detail: "Saved observation note on 1000 bp, 750 bp, and 500 bp DNA ladder migration.",
    },
    {
      id: "act-3",
      icon: "⚡",
      title: "PCR Cycling Protocol Verified",
      time: "Yesterday",
      detail: "Calculated 1,073,741,824 target amplicons generated at Cycle 30.",
    },
    {
      id: "act-4",
      icon: "🧬",
      title: "DNA Extraction Spooling Verified",
      time: "2 days ago",
      detail: "Pure strawberry DNA threads isolated at the ethanol-filtrate interface.",
    },
  ];
}

/* ==================================================================
   API SERVICE METHODS (With Graceful Fallback & Auth)
   ================================================================== */

export async function getExperiments(): Promise<Experiment[]> {
  try {
    const res = await fetch(`${API_URL}/api/experiments`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Network offline or backend unreachable
  }
  return FALLBACK_EXPERIMENTS;
}

export async function getExperimentById(id: number): Promise<Experiment | null> {
  try {
    const res = await fetch(`${API_URL}/api/experiments/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return FALLBACK_EXPERIMENTS.find((e) => e.id === id) || null;
}

export async function getProgress(experimentId?: number): Promise<ProgressData | null> {
  if (experimentId === undefined) return null;
  try {
    const res = await fetch(`${API_URL}/api/progress/${experimentId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      offlineProgress[experimentId] = data;
      return data;
    }
  } catch {
    // fallback
  }
  return offlineProgress[experimentId] || {
    experiment_id: experimentId,
    completed_sections: [],
    lab_score: 0,
    lab_time: 0,
    mistakes: 0,
    is_completed: false
  };
}

export async function getAllProgress(): Promise<ProgressOverview> {
  try {
    const res = await fetch(`${API_URL}/api/progress`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.progress) {
        return data;
      }
    }
  } catch {
    // fallback
  }
  const list = Object.values(offlineProgress);
  const completed = list.filter((p) => p.is_completed || p.completed_sections.length >= 7).length;
  const totalScore = list.reduce((a, b) => a + (b.lab_score || 0), 0);
  return {
    progress: list,
    summary: {
      total_experiments: 5,
      completed_experiments: completed,
      overall_percentage: Math.round((completed / 5) * 100),
      average_lab_score: list.length ? Math.round(totalScore / list.length) : 0
    }
  };
}

export async function saveProgress(data: {
  experiment_id: number;
  completed_sections?: string[];
  lab_score?: number;
  lab_time?: number;
  mistakes?: number;
  is_completed?: boolean;
}): Promise<void> {
  const current = offlineProgress[data.experiment_id] || {
    experiment_id: data.experiment_id,
    completed_sections: [],
    lab_score: 0,
    lab_time: 0,
    mistakes: 0,
    is_completed: false
  };

  const updated: ProgressData = {
    ...current,
    ...data,
    completed_sections: data.completed_sections || current.completed_sections,
    lab_score: data.lab_score !== undefined ? data.lab_score : current.lab_score,
    lab_time: data.lab_time !== undefined ? data.lab_time : current.lab_time,
    mistakes: data.mistakes !== undefined ? data.mistakes : current.mistakes,
    is_completed: data.is_completed !== undefined ? data.is_completed : current.is_completed,
    last_updated: new Date().toISOString()
  };

  offlineProgress[data.experiment_id] = updated;

  try {
    await fetch(`${API_URL}/api/progress`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(updated)
    });
  } catch {
    // offline save is active
  }
}

export async function getQuizResults(experimentId?: number): Promise<QuizResult[]> {
  try {
    const url = experimentId ? `${API_URL}/api/quiz-results?experiment_id=${experimentId}` : `${API_URL}/api/quiz-results`;
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch {
    // fallback
  }
  if (experimentId) {
    return offlineQuizResults.filter((q) => q.experiment_id === experimentId);
  }
  return offlineQuizResults;
}

export async function saveQuizResult(data: {
  experiment_id: number;
  score: number;
  total: number;
}): Promise<QuizResult> {
  const record: QuizResult = {
    id: `q-${Date.now()}`,
    experiment_id: data.experiment_id,
    score: data.score,
    total: data.total,
    percentage: Math.round((data.score / data.total) * 100),
    created_at: new Date().toISOString()
  };
  offlineQuizResults.unshift(record);

  try {
    const res = await fetch(`${API_URL}/api/quiz-results`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const respData = await res.json();
      return respData.data || record;
    }
  } catch {
    // offline
  }
  return record;
}

export async function getNotes(experimentId?: number): Promise<LabNote[]> {
  try {
    const url = experimentId ? `${API_URL}/api/notes?experiment_id=${experimentId}` : `${API_URL}/api/notes`;
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {
    // fallback
  }
  if (experimentId) {
    return offlineNotes.filter((n) => n.experiment_id === experimentId);
  }
  return offlineNotes;
}

export async function addNote(data: {
  experiment_id: number;
  experiment_name: string;
  title: string;
  content: string;
}): Promise<LabNote> {
  const newNote: LabNote = {
    id: `note-${Date.now()}`,
    experiment_id: data.experiment_id,
    experiment_name: data.experiment_name,
    title: data.title || "Lab Observation",
    content: data.content,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  };
  offlineNotes.unshift(newNote);

  try {
    const res = await fetch(`${API_URL}/api/notes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const resData = await res.json();
      return resData.note || newNote;
    }
  } catch {
    // offline
  }
  return newNote;
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
): Promise<LabNote | null> {
  const existing = offlineNotes.find((n) => n.id === id);
  if (existing) {
    if (data.title) existing.title = data.title;
    if (data.content) existing.content = data.content;
  }

  try {
    await fetch(`${API_URL}/api/notes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  } catch {
    // offline
  }
  return existing || null;
}

export async function deleteNote(id: string): Promise<void> {
  offlineNotes = offlineNotes.filter((n) => n.id !== id);
  try {
    await fetch(`${API_URL}/api/notes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  } catch {
    // offline
  }
}

export async function askMentor(experimentId: number, question: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/mentor`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ experiment_id: experimentId, question })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.answer) {
        return data.answer;
      }
    }
  } catch {
    // fallback
  }

  // Client-side rule based FAQ fallback
  const exp = FALLBACK_EXPERIMENTS.find((e) => e.id === experimentId);
  if (!exp) return "Experiment not found.";

  const qLower = question.toLowerCase();
  for (const faq of exp.ai_faqs) {
    const fWords = faq.question.toLowerCase().split(" ").filter((w) => w.length > 3);
    const matches = fWords.filter((w) => qLower.includes(w));
    if (matches.length >= 2) {
      return faq.answer;
    }
  }

  if (qLower.includes("aim") || qLower.includes("purpose")) return exp.aim;
  if (qLower.includes("theory") || qLower.includes("how does")) return exp.theory;
  if (qLower.includes("result") || qLower.includes("observe")) {
    return typeof exp.result === "string" ? exp.result : JSON.stringify(exp.result);
  }

  return `I'm your Lab Mentor for ${exp.experiment}. I can explain the biochemical theory, the role of each reagent, safety precautions, or the expected experimental outcome. Try asking a specific question!`;
}
