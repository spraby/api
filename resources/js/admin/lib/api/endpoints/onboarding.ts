import type { OnboardingHintKey, OnboardingState } from '@/components/onboarding/types';

import fetchClient from '../fetch-client';


interface UpdateOnboardingResponse {
  onboarding: OnboardingState;
}

export const ONBOARDING_UPDATED_EVENT = 'admin:onboarding-updated';

export async function updateOnboarding(
  action: 'dismiss' | 'hide_hint',
  step?: OnboardingHintKey,
): Promise<OnboardingState> {
  const response = await fetchClient.put<UpdateOnboardingResponse>('/admin/onboarding', {
    action,
    step,
  });

  window.dispatchEvent(new CustomEvent<OnboardingState>(ONBOARDING_UPDATED_EVENT, {
    detail: response.data.onboarding,
  }));

  return response.data.onboarding;
}
