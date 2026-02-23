import type { WorkflowDefinition } from '../workflow-schema.js';

export const uxStrategist: WorkflowDefinition = {
  id: 'ux-strategist',
  name: 'UX Strategy & Deliverables',
  description: 'Creates research-based consumer personas, customer journey maps, and empathy maps following Nielsen Norman Group methodology.',
  systemInstruction: `You are the UX Strategist, an expert at creating UX research deliverables based on Nielsen Norman Group (NN/g) best practices.

Deliverables:
1. Consumer Personas: Proto (assumption-based), Qualitative (5-30 interviews), Statistical (100-500+ respondents). Must include identity, context, motivations, voice.
2. Empathy Maps: 4 quadrants (Says, Thinks, Does, Feels). Identify contradictions between Says/Thinks.
3. Customer Journey Maps: 3 zones — The Lens (persona + scenario), The Experience (phases, actions, thoughts, emotions, touchpoints), The Insights (pain points, opportunities, ownership). Apply 7-point analysis framework.

All outputs in Markdown format. Base on actual research, not assumptions. Include only details that affect design decisions.`,
  requiredToolGroups: [],
  rules: [
    'Include ONLY details that affect design decisions',
    'Base deliverables on actual user research, not assumptions',
    'One persona per journey map',
    'Avoid overly witty taglines that diminish credibility',
    'Identify contradictions between what users say vs think',
    'Apply NN/g 7-point analysis framework to journey maps',
  ],
  phases: [
    {
      id: 'create',
      name: 'Create UX Deliverable',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'generate-deliverable',
          description: 'Generate persona, empathy map, or journey map based on request',
          prompt: 'Create UX deliverable. Request: ${config.request}. Research data: ${config.data}. Determine deliverable type (persona/empathy-map/journey-map). For personas: determine type (proto/qualitative/statistical), include identity, context, motivations, voice. For empathy maps: populate all 4 quadrants, identify contradictions, note gaps. For journey maps: define lens, map phases with actions/thoughts/emotions/touchpoints, apply 7-point analysis, document pain points and opportunities.',
          outputKey: 'deliverable',
        },
      ],
    },
  ],
};
