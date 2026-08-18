export type OnboardingHintKey = 'categories' | 'settings' | 'product';

export type OnboardingMainStep = 'categories' | 'settings' | 'product' | 'complete';
export type CategoryOnboardingStatus = 'not_submitted' | 'pending' | 'approved' | 'partial' | 'rejected';

export interface OnboardingState {
  visible: boolean;
  can_dismiss: boolean;
  hidden_hints: OnboardingHintKey[];
  progress: {
    completed: number;
    total: number;
    current_step: OnboardingMainStep;
  };
  steps: {
    categories: {
      completed: boolean;
      status: CategoryOnboardingStatus;
    };
    settings: {
      completed: boolean;
      resolved_count: number;
      total: number;
    };
    product: {
      completed: boolean;
      blocked: boolean;
    };
  };
}
