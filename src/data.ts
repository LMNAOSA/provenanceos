export const EXPERT_RESPONSES = {
  mat: {
    id: 'mat',
    name: "Mat Kathagen",
    role: "Field",
    interpretation: "Looks like a standard hard matrix opal, but the afterglow is unusual for this specific seam. The blue is intense.",
    basis: "Visual heuristics, location context within Andamooka.",
    probability: "60%",
    evidenceRequest: "Need to know if there are trace elements causing the glow.",
    reassessment: "If it's uranium-linked, we handle it differently. The lack of standard activators means it's structural.",
  },
  nigel: {
    id: 'nigel',
    name: "Professor Nigel Spooner",
    role: "Radiation physics & luminescence",
    interpretation: "The 7-second phosphorescence decay suggests a specific luminescent center, potentially defect-driven rather than impurity-driven.",
    basis: "Luminescence decay rates, physics.",
    probability: "75%",
    evidenceRequest: "Require pXRF to identify trace activators.",
    reassessment: "The absence of expected trace elements shifts the probability toward a structural defect rather than a chemical impurity in the silica lattice.",
  },
  danielle: {
    id: 'danielle',
    name: "Danielle Questiaux",
    role: "Geological / analytical perspective",
    interpretation: "Anomalous spectroscopic signature expected based on the visual afterglow. It shouldn't hold light this long.",
    basis: "Chemical composition expectations.",
    probability: "70%",
    evidenceRequest: "pXRF is mandatory to rule out common activators like Copper or Uranium.",
    reassessment: "Without typical activators present in the pXRF, we must consider localized structural anomalies.",
  }
};
