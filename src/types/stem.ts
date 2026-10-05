export type StemCategory = 'chemistry' | 'physics' | 'mathematics' | 'biology';

export type SchoolGrade = 'all' | 'grade_7' | 'grade_8' | 'grade_9' | 'grade_10' | 'grade_11' | 'grade_5_6' | 'grade_7_8' | 'grade_10_11';

export type VisualMode = 
  | 'textbook'
  | 'labs'
  | 'practice'
  | 'course_map'
  | 'progress'
  | 'pro'
  | 'teacher'
  | 'classes'
  | 'sandbox'
  | 'circuits'
  | 'orbitals' 
  | 'deconstruction' 
  | 'physics_gravity' 
  | 'math_revolution' 
  | 'math_divergence' 
  | 'biology_cell' 
  | 'break_model' 
  | 'knowledge_map'
  | 'moment_diffusion'
  | 'moment_states'
  | 'moment_optics'
  | 'moment_lever'
  | 'moment_collision'
  | 'moment_induction'
  | 'moment_relativity'
  | 'moment_dna'
  | 'moment_circuit'
  | 'moment_chemical_bond'
  | 'moment_pendulum'
  | 'moment_trig_circle'
  | 'moment_derivative'
  | 'moment_photosynthesis'
  | 'moment_mendel'
  | 'moment_pascal'
  | 'moment_doppler'
  | 'moment_electrolysis'
  | 'moment_periodic'
  | 'moment_neuron'
  | 'moment_pythagoras'
  | 'moment_gauss'
  | 'moment_universal';

export type OrbitalType = '1s' | '2s' | '2px' | '2pz' | '3dz2' | '3dxy' | '4f';

export type OrbitalRenderStyle = 'density' | 'dots' | 'phase' | 'nodes' | 'slice';

export type ExplanationLevel = 1 | 2 | 3 | 4; // 1: Beginner, 2: School, 3: Advanced, 4: University

export interface ExplanationTier {
  level: ExplanationLevel;
  badge: { en: string; ru: string };
  title: { en: string; ru: string };
  content: { en: string; ru: string };
  mathFormula?: string;
  visualCue?: { en: string; ru: string };
}

export type SimEngineType = 
  | 'measurement_error'
  | 'brownian_diffusion'
  | 'states_of_matter'
  | 'kinematics_velocity'
  | 'inertia_density'
  | 'hooke_spring'
  | 'friction_dynamometer'
  | 'pascal_vessels'
  | 'barometer_atmosphere'
  | 'hydraulic_press'
  | 'archimedes_buoyancy'
  | 'work_power'
  | 'levers_pulleys'
  | 'kinetic_potential_energy'
  | 'heat_convection_conduction'
  | 'specific_heat_calorimetry'
  | 'heat_engines_carnot'
  | 'electrostatic_charges'
  | 'electric_circuit_ohm'
  | 'series_parallel_circuits'
  | 'joule_heating'
  | 'magnetic_field_current'
  | 'electromagnet_motor'
  | 'light_reflection_mirror'
  | 'light_refraction_snell'
  | 'lenses_ray_tracing'
  | 'eye_optics_vision'
  | 'newton_laws_freefall'
  | 'circular_orbit_satellites'
  | 'momentum_rocket_recoil'
  | 'pendulum_resonance'
  | 'waves_sound_doppler'
  | 'faraday_induction_lenz'
  | 'ac_transformer'
  | 'em_waves_dispersion'
  | 'rutherford_alpha_atom'
  | 'nuclear_fission_reactor'
  | 'nuclear_fusion_sun'
  | 'universe_solar_stars'
  | 'mkt_ideal_gas_laws'
  | 'thermodynamics_first_law'
  | 'coulomb_capacitors'
  | 'ohm_full_circuit_emf'
  | 'lorentz_ampere_force'
  | 'lc_circuit_thomson'
  | 'wave_interference_diffraction'
  | 'einstein_relativity_time'
  | 'photoelectric_effect'
  | 'bohr_atom_lasers'
  | 'radioactive_decay_halflife'
  | 'elementary_particles'
  | 'stellar_evolution_hr'
  | 'chemical_bonding'
  | 'photosynthesis'
  | 'dna_replication'
  | 'mendel_genetics'
  | 'derivative_tangent'
  | 'integral_revolution'
  | 'vector_divergence'
  | 'pythagorean_proof'
  | 'galton_normal_distribution';

export interface TextbookLesson {
  id: string;
  grade: SchoolGrade;
  category: StemCategory;
  gradeBadge: { en: string; ru: string };
  chapter?: { en: string; ru: string };
  title: { en: string; ru: string };
  subtitle: { en: string; ru: string };
  textbookDefinition: { en: string; ru: string };
  studentConfusion: { en: string; ru: string };
  lifeAnalogy: { en: string; ru: string };
  momentObservation: { en: string; ru: string };
  formula?: string;
  viewMode: VisualMode;
  simEngineType?: SimEngineType;
  initialParams?: Record<string, any>;
  keywords: string[];
}

export interface ConceptItem {
  id: string;
  category: StemCategory;
  grade?: SchoolGrade;
  title: { en: string; ru: string };
  subtitle: { en: string; ru: string };
  iconName: string;
  viewMode: VisualMode;
  initialParams?: Record<string, any>;
  keywords: string[];
  tiers: ExplanationTier[];
}

export interface Milestone {
  id: string;
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  icon: string;
  unlocked: boolean;
}

export interface PredictionChallenge {
  id: string;
  topic: string;
  question: { en: string; ru: string };
  options: {
    id: string;
    text: { en: string; ru: string };
    isCorrect: boolean;
    explanation: { en: string; ru: string };
  }[];
  revealedModelParams: Record<string, any>;
}

