import type { AppRefs } from "../refs";
import type { AppViewModel } from "../view-models";

export function renderHeader(refs: AppRefs, viewModel: AppViewModel): void {
  refs.pillTitle.textContent = viewModel.title;
  refs.pillTotal.textContent = viewModel.totalPill;
  refs.pillPeople.textContent = viewModel.peoplePill;
  refs.pillTotalSticky.textContent = viewModel.totalPill;
  refs.pillPeopleSticky.textContent = viewModel.peoplePill;
}
