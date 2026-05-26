/**
 * Unit tests for the inline menu password generator behavior setting.
 *
 * The setting is stored as a single enum value:
 *   - `Normal` (default) — original extension behavior, popup always shown.
 *   - `AlwaysDisable` — suppress popup unconditionally.
 *   - `DisableWhenSiteExists` — suppress popup only when a saved Login exists for the site.
 *
 * Tests confirm:
 *   - The setting defaults to `Normal` when no persisted value exists.
 *   - The setter correctly persists each enum value.
 *   - The observable reflects the latest persisted value.
 */

import { mock } from "jest-mock-extended";
import { firstValueFrom } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import {
  FakeAccountService,
  FakeStateProvider,
  mockAccountServiceWith,
} from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";
import { RestrictedItemTypesService } from "@bitwarden/common/vault/services/restricted-item-types.service";

import { InlineMenuPasswordGeneratorBehavior } from "../types";

import { AutofillSettingsService } from "./autofill-settings.service";

describe("AutofillSettingsService — inlineMenuPasswordGeneratorBehavior", () => {
  const mockUserId = Utils.newGuid() as UserId;
  let accountService: FakeAccountService;
  let stateProvider: FakeStateProvider;
  let policyService: ReturnType<typeof mock<PolicyService>>;
  let restrictedItemTypesService: ReturnType<typeof mock<RestrictedItemTypesService>>;
  let service: AutofillSettingsService;

  beforeEach(() => {
    accountService = mockAccountServiceWith(mockUserId);
    stateProvider = new FakeStateProvider(accountService);
    policyService = mock<PolicyService>();
    restrictedItemTypesService = mock<RestrictedItemTypesService>();

    service = new AutofillSettingsService(
      stateProvider,
      policyService,
      accountService as unknown as AccountService,
      restrictedItemTypesService,
    );
  });

  describe("inlineMenuPasswordGeneratorBehavior$", () => {
    it("defaults to Normal when no persisted value exists", async () => {
      const value = await firstValueFrom(service.inlineMenuPasswordGeneratorBehavior$);
      expect(value).toBe(InlineMenuPasswordGeneratorBehavior.Normal);
    });

    it("emits AlwaysDisable after setInlineMenuPasswordGeneratorBehavior(AlwaysDisable)", async () => {
      await service.setInlineMenuPasswordGeneratorBehavior(
        InlineMenuPasswordGeneratorBehavior.AlwaysDisable,
      );
      const value = await firstValueFrom(service.inlineMenuPasswordGeneratorBehavior$);
      expect(value).toBe(InlineMenuPasswordGeneratorBehavior.AlwaysDisable);
    });

    it("emits DisableWhenSiteExists after setInlineMenuPasswordGeneratorBehavior(DisableWhenSiteExists)", async () => {
      await service.setInlineMenuPasswordGeneratorBehavior(
        InlineMenuPasswordGeneratorBehavior.DisableWhenSiteExists,
      );
      const value = await firstValueFrom(service.inlineMenuPasswordGeneratorBehavior$);
      expect(value).toBe(InlineMenuPasswordGeneratorBehavior.DisableWhenSiteExists);
    });

    it("returns to Normal after setting back to Normal", async () => {
      await service.setInlineMenuPasswordGeneratorBehavior(
        InlineMenuPasswordGeneratorBehavior.AlwaysDisable,
      );
      await service.setInlineMenuPasswordGeneratorBehavior(
        InlineMenuPasswordGeneratorBehavior.Normal,
      );
      const value = await firstValueFrom(service.inlineMenuPasswordGeneratorBehavior$);
      expect(value).toBe(InlineMenuPasswordGeneratorBehavior.Normal);
    });
  });
});
