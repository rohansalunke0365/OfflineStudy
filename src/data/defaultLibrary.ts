import { Playlist } from '../types';

export const VAULT_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu9nyAQd3dNcpfLWSHP15Rh4KhsDq_DfF18iwf1b0qJKJdRV-ZLv-4HevqVRLKLF-1s-6iIu-TlXSCRAwKS7a9612-1R87wEd4RbLPjKtU19KWw933F7p3P_WQdcGVYerecD34cELd08MURb3TMdFWZwr9eTB853TYYUfBiAOg_Ie0-qY_QDHTytMF-SKRzbmWB7JN89OLGDuk4OqYQM0VlCXEp-r0F3XtN0DhJ9DpOkvm6iHWN-qAyA';

export const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: 'thermodynamics-101',
    name: 'Advanced Thermodynamics',
    path: 'Engineering/Thermodynamics',
    badge: 'Module 4',
    description: 'Precision physical simulations of entropy, enthalpy, thermal gradient dispersal and stator vane aerodynamics.',
    videos: [
      {
        id: 'thermo-04',
        name: '04_Entropy_and_Enthalpy_Stator_Vane.mp4',
        title: 'Entropy and Enthalpy',
        chapter: 'CH-04 • ENTROPY AND ENTHALPY',
        description: '3D finite element simulation of turbulent entropy flux and thermodynamic state evolution across a high-temperature stator vane segment.',
        duration: 842, // 14:02
        size: 420 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 2,
        folderPath: 'Engineering/Thermodynamics',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjZFis_oCMqYlJQ-UPWKxwnRv4v_j0-hoMxzliu3PRCe3rMXBsLLDvtvVZt-OYq58D0FxNA6fZKSTTXhPwqaNQrCdru5tvOcOV0eTNzuCovG-tkkDRaAIo45LpTeaX0o46aMA-GIF3qiCZg_WjwbXxbH5iXZgr5ZupPcHDHz62AMv8fJoovOk6FvROcZs4BsIndC3Om9JiZhwWhA4S1fXcllv-fCLAiYySolAGygfeDi1UQlTv2TLY7Q',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        is3dSimulation: true,
        simulationType: 'thermodynamics',
        tags: ['Physics', 'Thermodynamics', '3D Simulation', 'CFD']
      },
      {
        id: 'thermo-01',
        name: '01_Laws_of_Thermodynamics.mp4',
        title: 'Laws of Thermodynamics',
        chapter: 'CH-01 • FIRST AND SECOND LAW',
        description: 'Rigorous mathematical formulation of macroscopic conservation laws and microstate equilibrium equations.',
        duration: 1335, // 22:15
        size: 380 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 7,
        folderPath: 'Engineering/Thermodynamics',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlCAVGSuocPEodx9oqTAQJuwOqPNxNXFHL4ERXKfkc_Xcheuk7W1hS-rsIcVbOvhgBf--r4HScKxK43Leb0gNhKL6vGti2hHqkG_G1dGbnqb06Se9OHEsgCrTNr9fIYcOdb-CDIf9hZd0qfxSGBdsRd383I8FR_JUIhvyp-r57cbhir9DlOHz5IO8JyY8zfs3kGLesASN79LD_9P2MkYeLm_ftNDgfUduJhdMSN1Riq2Xodk_W1g6Mlg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        is3dSimulation: true,
        simulationType: 'thermodynamics',
        tags: ['Physics', 'Thermodynamics']
      },
      {
        id: 'thermo-02',
        name: '02_Pressure_Volume_Work.mp4',
        title: 'Pressure & Volume Work',
        chapter: 'CH-02 • P-V ISOTHERMAL CYCLES',
        description: 'Cyclic polytropic processes, work integrals, indicator diagrams, and adiabatic expansion curves.',
        duration: 1120, // 18:40
        size: 310 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 5,
        folderPath: 'Engineering/Thermodynamics',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtMPUulx6NDF67LAkJJKORfkfE2nkOBQxk9XiZKFgQQ_q8GaktzDKFVW6BpiNEwSHpjQbrjF3K--XXDp-VL86txoEv3xTmmxwxOnPcFFTDqJWaAmnfEKhFs1pQw2QvMTVjWcKrsK-sNf5bLUk_Ua525rIfM2WYgY-Y1FVR_69LdqE0zSQQcoj_GSDWjeQR7YwlqhDKADZ9qYFJcrvVBqUg7FF0cveep3Fo7n1d8jrrAHYqF8rCghv6pQ',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        is3dSimulation: true,
        simulationType: 'thermodynamics',
        tags: ['Engineering', 'Fluid Dynamics']
      },
      {
        id: 'thermo-03',
        name: '03_Carnot_Efficiency_and_Exergy.mp4',
        title: 'Carnot Cycles & Exergy Analysis',
        chapter: 'CH-03 • REVERSIBILITY AND EXERGY',
        description: 'Upper theoretical limits of thermal conversion efficiency, heat sinks, and ambient entropy creation.',
        duration: 1740, // 29:00
        size: 512 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 3,
        folderPath: 'Engineering/Thermodynamics',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ42Y-jeMElcc9R6RMA7DpWhpRfqG4jfxoYBd2_WQIgDYQt6ykhY_WbsSuGr9ex9xsnTXLdJNZMGTQI_2vjaxBev_gB1YUM-d5gOh_S8v0Fdzbw7AdPGhZ_vvOTbAnRLNR6tVNWctLK5jhrC0_i_NP838fELLnpcqGPOLvHTK5xye0ukVCnUnhaASTRSfmQJ6YvscAP10IC-XDAgfbgBJQFJYTqrVGTSvLt4LhF3LRr-yfMMDs3ZtcIA',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        tags: ['Exergy', 'Thermodynamics']
      }
    ]
  },
  {
    id: 'quantum-computing',
    name: 'Quantum Information & Architecture',
    path: 'ComputerScience/QuantumComputing',
    badge: 'Hardware Track',
    description: 'Qubit superposition matrices, cryogenic quantum error correction, and superconducting pulse control.',
    videos: [
      {
        id: 'quantum-01',
        name: '01_Quantum_Computing_Basics.mp4',
        title: 'Quantum Computing Basics',
        chapter: 'MOD-01 • HILBERT SPACES & QUBITS',
        description: 'An introduction to quantum mechanics and its application in modern computational theory.',
        duration: 863, // 14:23
        size: 450 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 10,
        folderPath: 'ComputerScience/QuantumComputing',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRQFOHGMQojtWrqdjb2Zdb_EnoRB5Hx7MuQkLUzSGrDNGoTfBxqM5eYvaf3ElfZfkXjIBKr1sE6f0PdCnvOVR5jvHlMJyThikt6wqFa5AS1NNuIIpBwbdFQqQQ5PGl1vzzakFWlNodBibnU-V1MNynFIroSjk6Ov4btDMnvbzELda-nN1JGHLtDh73ulbUij25FUksniyezIu16HNcvxUCCIoqacWyjVKhqVNs4rmA7trMflVkeAGnzw',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        is3dSimulation: true,
        simulationType: 'quantum',
        tags: ['Quantum', 'Superconducting', 'Physics']
      },
      {
        id: 'quantum-02',
        name: '02_Superconducting_Qubit_Coupling.mp4',
        title: 'Superconducting Transmon Coupling',
        chapter: 'MOD-02 • TRANSMON COUPLING',
        description: 'Josephson junction non-linear inductance and microwave resonator dispersive readout.',
        duration: 2100, // 35:00
        size: 610 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 8,
        folderPath: 'ComputerScience/QuantumComputing',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRQFOHGMQojtWrqdjb2Zdb_EnoRB5Hx7MuQkLUzSGrDNGoTfBxqM5eYvaf3ElfZfkXjIBKr1sE6f0PdCnvOVR5jvHlMJyThikt6wqFa5AS1NNuIIpBwbdFQqQQ5PGl1vzzakFWlNodBibnU-V1MNynFIroSjk6Ov4btDMnvbzELda-nN1JGHLtDh73ulbUij25FUksniyezIu16HNcvxUCCIoqacWyjVKhqVNs4rmA7trMflVkeAGnzw',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
        tags: ['Quantum', 'Hardware']
      }
    ]
  },
  {
    id: 'hardware-circuits',
    name: 'High-Frequency Circuit Design',
    path: 'Hardware/CircuitDesign',
    badge: 'Lab Series',
    description: 'High-frequency microstrip routing, impedance matching, substrate dielectric losses, and EMI suppression.',
    videos: [
      {
        id: 'circuit-01',
        name: '01_Advanced_Circuit_Design.mp4',
        title: 'Advanced Circuit Design',
        chapter: 'CH-01 • HIGH-SPEED SIGNAL INTEGRITY',
        description: 'Deep dive into high-frequency PCB layouts and signal integrity for multi-gigabit differential pairs.',
        duration: 2710, // 45:10
        size: 720 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 4,
        folderPath: 'Hardware/CircuitDesign',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4yMB8Wfgnp01IB-3poK3nJlaO2jkl_N41cUKFsQBfTVTO-sfU56P62NTO0DLZafGHrlWY8PLZBZ9ci6zTiiJvgm1hCazVfrDK2UQ5M--TX84s4UADsoHCXjoPxp_MftPikClpD7Vj2ZC0RFsWk92jR2_Hs4f_Y-drRp-228IW3f29WROFXqQ1Ou7X66EBETPSDloNhzmhbgdJcTOigM_lpLJLMxZ9bgCCppfKBuo563iIdtqeANQL9g',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        is3dSimulation: true,
        simulationType: 'circuits',
        tags: ['Hardware', 'PCB', 'RF Design']
      }
    ]
  },
  {
    id: 'system-architecture',
    name: 'Distributed Systems & Patterns',
    path: 'Architecture/DistributedSystems',
    badge: 'Core Curriculum',
    description: 'Consensus protocols, Raft state replication, vector clocks, and resilient fault-tolerant distributed topology.',
    videos: [
      {
        id: 'arch-01',
        name: '01_Structural_Patterns.mp4',
        title: 'Structural Patterns',
        chapter: 'MOD-01 • LARGE SCALE RESILIENCE',
        description: 'Design patterns for scalable and maintainable large software systems with strict partition tolerance.',
        duration: 4325, // 1:12:05
        size: 980 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 1,
        folderPath: 'Architecture/DistributedSystems',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8d4EPx4xzsfZai69YPWFVgtY6djl5vuvjZfFRuCfDBt2QGielpblIhtertqy4TJEwGmwMSPCXlXFofTdKlzMNijbHfcDXYyl8qwC4e2fVMcCINpu_z7XD9HAftSSPiE2Dr46qDRzkhkMGcxmCctKhCCPFLL41SBlI50V9wk9t1E9_W-BtZP4BJAi_qXAW50FMJ0_IgVM9W58PIRcrofQOKJZoUfdOVfJRJXnQzYK1_kCSyRlm6yQSVg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        tags: ['Architecture', 'Distributed Systems']
      }
    ]
  },
  {
    id: 'neural-networks',
    name: 'Neural Network Foundations',
    path: 'AI/NeuralArchitectures',
    badge: 'AI Research',
    description: 'Backpropagation dynamics, attention mechanism matrix dot-products, and tensor pipeline optimization.',
    videos: [
      {
        id: 'neural-01',
        name: '01_Neural_Networks_Foundations.mp4',
        title: 'Neural Networks: Architectural Foundations',
        chapter: 'LEC-01 • BACKPROP & ATTENTION TENSORS',
        description: 'Mathematical derivation of auto-differentiation graphs and multi-head flash attention operations.',
        duration: 4325, // 1:12:05
        size: 910 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 6,
        folderPath: 'AI/NeuralArchitectures',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD14yJpKGy8SW4CDs1NLlyuIZpSfRmH5SBZL9OPZ4Z9ZTvbcMy3KMPuQxsJipk8U757Rkw8MSBneQO7oGkeS7bnNtY46MKAsbOA9n2_osdF8eFnqH-bRVgpsyVWFXtwNPsDf15KT1pTtou8bFtZ2JFb-wgQ2p3iHxbvG27tniSx1WErfiL2FICYKjLNZfGBM7E0hLH9ME3WSxVRVXBp--a-p9aSVot7VyJSrGuDNKYEjHLX7HC5pPlBA',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        is3dSimulation: true,
        simulationType: 'neural',
        tags: ['AI', 'Deep Learning', 'Tensors']
      }
    ]
  },
  {
    id: 'graphics-3d',
    name: '3D Graphics & Physics',
    path: 'Graphics/3DPhysics',
    badge: 'Visual Compute',
    description: 'Path tracing, microfacet BRDF reflectance models, and volumetric photon radiance transport.',
    videos: [
      {
        id: 'graphics-01',
        name: '01_Advanced_3D_Modeling_Techniques.mp4',
        title: 'Advanced 3D Modeling & Lighting Physics',
        chapter: 'MOD-01 • RADIANCE FIELDS & BRDF',
        description: 'Volumetric path tracing, physical light transport equations, and real-time GPU sub-surface scattering.',
        duration: 2712, // 45:12
        size: 840 * 1024 * 1024,
        lastModified: Date.now() - 86400000 * 12,
        folderPath: 'Graphics/3DPhysics',
        ext: 'mp4',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqLwaa-ADcRIzRGNPk7oG1KUKjHGTJRgxp9v-efxc7w2NVsQbnYvNHryGxSLP5DweLUCdgVrQDGKswTq9xIlhnhYa713Jcf661taY9BC6y-LvNLK9PgqRj051d_NFRNJfowuKqDtFwOv19Mp2LMo3yrdjR02GRRuLkYCTdeOtf-qdhIA7P-y01PYPhcDNwDNokuWbWrFi5YAELn6F3dMkeIhNgRgbE24VtA05C3mVcwl4uUgt6-zlW5g',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        tags: ['3D', 'Graphics', 'Rendering']
      }
    ]
  }
];

export const INITIAL_PROGRESS: Record<string, { time: number; duration: number; watched: boolean; lastWatched: number; savedToVault?: boolean }> = {
  'thermo-04': { time: 842 * 0.42, duration: 842, watched: false, lastWatched: Date.now() - 1000 * 60 * 15, savedToVault: true },
  'thermo-01': { time: 1335 * 0.88, duration: 1335, watched: false, lastWatched: Date.now() - 1000 * 60 * 60 * 3 },
  'quantum-01': { time: 863 * 0.95, duration: 863, watched: true, lastWatched: Date.now() - 1000 * 60 * 60 * 24 },
  'circuit-01': { time: 2710 * 0.68, duration: 2710, watched: false, lastWatched: Date.now() - 1000 * 60 * 60 * 48 },
  'neural-01': { time: 4325 * 0.12, duration: 4325, watched: false, lastWatched: Date.now() - 1000 * 60 * 60 * 72 },
  'graphics-01': { time: 2712 * 0.68, duration: 2712, watched: false, lastWatched: Date.now() - 1000 * 60 * 60 * 96, savedToVault: true }
};
