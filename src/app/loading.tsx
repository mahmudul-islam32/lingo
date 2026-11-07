import { LoadingState } from "./_shell/LoadingState";
import { Main } from "./_shell/Main";

/** Loading UI for routes outside the tabs group (e.g. `/onboarding`). */
export default function RootLoading() {
  return (
    <Main>
      <LoadingState />
    </Main>
  );
}
