import { Profile } from '@ninetailed/experience.js';
import { MergeTag } from './MergeTag';
import { render, RenderOptions, screen } from '@testing-library/react';
import { PropsWithChildren, ReactElement } from 'react';
import { useProfile } from '../useProfile';
import { NinetailedProvider } from '../NinetailedProvider';
import { Change, ChangeTypes } from '@ninetailed/experience.js-shared';
const profile: Profile = {
  id: '',
  stableId: '',
  random: 0,
  audiences: [],
  traits: {
    firstname: 'John',
    nested: {
      foo: 'bar',
      baz: { qux: 'grml' },
      baz_qux: 'quux',
    },
    non_nested: 123,
  },
  location: {},
  session: {
    id: '1a2b3c4d5e6f7g8h9i0j',
    isReturningVisitor: false,
    landingPage: {
      url: '',
      referrer: '',
      query: {},
      search: '',
      path: '',
    },
    count: 2,
    activeSessionLength: 12,
    averageSessionLength: 43,
  },
};
const changes: Change[] = [
  {
    key: 'key4',
    value: 'baseline9',
    type: ChangeTypes.Variable,
    meta: { experienceId: 'exp_1', variantIndex: 0 },
  },
];
jest.mock('../useProfile');
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
mockUseProfile.mockReturnValue({
  loading: false,
  from: 'api',
  status: 'success',
  changes,
  profile: profile,
  error: null,
});
const ContextWrapper = ({ children }: PropsWithChildren) => {
  return <NinetailedProvider clientId={'test'}>{children}</NinetailedProvider>;
};
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: ContextWrapper, ...options });
describe('MergeTag', () => {
  it('should render the resolved data without given fallback', () => {
    customRender(<MergeTag id="traits.firstname" />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
  it('should render the resolved data with given fallback', () => {
    customRender(<MergeTag id="traits.firstname" fallback="Doe" />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
  it('should render the fallback if the data could no be resolved', () => {
    customRender(<MergeTag id="traits.nested.bar" fallback="Doe" />);
    expect(screen.getByText('Doe')).toBeInTheDocument();
  });
  it('should not render anything if the data could no be resolved and no fallback is provided', () => {
    customRender(<MergeTag id="traits.nested.bar" />);
    expect(screen.queryByText('John')).toBeNull();
  });
});
