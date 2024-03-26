import {
  Profile,
  ExperienceConfiguration,
  Reference,
  VariantRef,
} from '@ninetailed/experience.js-shared';
import type { DetachListeners } from 'analytics';

type Loading<TBaseline extends Reference> = {
  status: 'loading';
  loading: boolean;
  hasVariants: boolean;
  baseline: TBaseline;
  experience: null;
  variant: TBaseline;
  variantIndex: number;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: null;
};

type Success<TBaseline extends Reference, TVariant extends Reference> = {
  status: 'success';
  loading: boolean;
  hasVariants: boolean;
  baseline: TBaseline;
  experience: ExperienceConfiguration<TVariant> | null;
  variant: TBaseline | TVariant | VariantRef;
  variantIndex: number;
  audience: { id: string } | null;
  isPersonalized: boolean;
  profile: Profile;
  error: null;
};

type Fail<TBaseline extends Reference> = {
  status: 'error';
  loading: boolean;
  hasVariants: boolean;
  baseline: TBaseline;
  experience: null;
  variant: TBaseline;
  variantIndex: number;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: Error;
};

export type OnSelectVariantArgs<
  TBaseline extends Reference,
  TVariant extends Reference
> = {
  baseline: TBaseline;
  experiences: ExperienceConfiguration<TVariant>[];
};

export type OnSelectVariantCallbackArgs<
  TBaseline extends Reference,
  TVariant extends Reference
> = Loading<TBaseline> | Success<TBaseline, TVariant> | Fail<TBaseline>;

export type OnSelectVariantCallback<
  TBaseline extends Reference,
  TVariant extends Reference
> = (state: OnSelectVariantCallbackArgs<TBaseline, TVariant>) => void;

export type OnSelectVariant<
  TBaseline extends Reference = Reference,
  TVariant extends Reference = Reference
> = (
  args: OnSelectVariantArgs<TBaseline, TVariant>,
  cb: OnSelectVariantCallback<TBaseline, TVariant>
) => DetachListeners;
