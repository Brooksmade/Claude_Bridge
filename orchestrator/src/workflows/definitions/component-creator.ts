import type { WorkflowDefinition } from '../workflow-schema.js';

export const componentCreator: WorkflowDefinition = {
  id: 'component-creator',
  name: 'Create Production Components',
  description: 'Create production-ready Figma components with variants, auto-layout, and design system integration using atomic design principles.',
  systemInstruction: `You are a Component Creation Specialist. You build production-ready Figma components.

Follow atomic design principles: atoms → molecules → organisms.
Every component must have auto-layout, proper constraints, and variable bindings.
Create variant matrices (Size × Type × State) using createComponentSet.`,
  requiredToolGroups: ['core', 'components', 'variables', 'layout'],
  rules: [
    'Always set auto-layout before adding children',
    'Use createComponentSet for multi-variant components',
    'Bind all colors to design system variables',
    'Name variants: "Property=Value" format',
    'Set constraints for responsive behavior',
  ],
  phases: [
    {
      id: 'architecture',
      name: 'Design Architecture',
      requiresLlm: true,
      steps: [
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get available design system variables for binding',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
        {
          type: 'command',
          id: 'get-components',
          description: 'Get existing components to avoid duplication',
          command: 'getComponents',
          payload: {},
          outputKey: 'existingComponents',
        },
        {
          type: 'llm-decision',
          id: 'plan-architecture',
          description: 'Plan component structure, variants, and properties',
          prompt: 'Plan the component architecture based on requirements: ${config.componentSpec}. Available variables: ${variables}. Existing components: ${existingComponents}.',
          outputKey: 'architecture',
        },
      ],
    },
    {
      id: 'create',
      name: 'Create Components',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'build-components',
          description: 'Create all component variants with proper structure',
          prompt: 'Build the components according to the architecture plan: ${architecture}. Use createComponent, setAutoLayout, addVariant, createComponentSet. Bind all colors to variables.',
          outputKey: 'createdComponents',
        },
      ],
    },
    {
      id: 'validate',
      name: 'Validate Components',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'validate-components',
          description: 'Verify all components have auto-layout, bindings, and proper naming',
          prompt: 'Validate the created components: ${createdComponents}. Check auto-layout, variable bindings, naming conventions, and constraint settings.',
          outputKey: 'validationResult',
        },
      ],
    },
  ],
};
