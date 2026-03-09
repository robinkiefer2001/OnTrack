<script lang="ts">
  import type { HourlyRate } from "$lib/models/project";
  import type { Language } from "$lib/language";
  import {
    DEFAULT_HOURLY_RATES,
    loadHourlyRates,
    saveHourlyRates,
  } from "$lib/models/hourlyRates";
  import { formatBudget } from "$lib/features/projects/projectUtils";
  import { t, currentLanguage, setLanguage } from "$lib/language";

  let hourlyRates: HourlyRate[] = loadHourlyRates();
  let newRateType = "";
  let newRateAmount = 0;
  let savedMessage = false;

  function addRate() {
    if (!newRateType.trim() || newRateAmount <= 0) {
      alert($t.settings.areYouSure);
      return;
    }

    const newRate: HourlyRate = {
      rateID: Math.max(...hourlyRates.map((r) => r.rateID), 0) + 1,
      rateType: newRateType.trim(),
      hourlyRate: newRateAmount,
      isDefault: false,
    };

    hourlyRates = [...hourlyRates, newRate];
    newRateType = "";
    newRateAmount = 0;
  }

  function deleteRate(rateID: number) {
    if (hourlyRates.length <= 1) {
      alert($t.settings.areYouSure);
      return;
    }
    hourlyRates = hourlyRates.filter((r) => r.rateID !== rateID);
  }

  function setDefault(rateID: number) {
    hourlyRates = hourlyRates.map((r) => ({
      ...r,
      isDefault: r.rateID === rateID,
    }));
  }

  function saveRates() {
    saveHourlyRates(hourlyRates);
    savedMessage = true;
    setTimeout(() => {
      savedMessage = false;
    }, 3000);
  }

  function resetToDefaults() {
    if (confirm($t.settings.areYouSure)) {
      hourlyRates = DEFAULT_HOURLY_RATES;
      saveHourlyRates(hourlyRates);
      savedMessage = true;
      setTimeout(() => {
        savedMessage = false;
      }, 3000);
    }
  }

  function changeLanguage(lang: Language) {
    setLanguage(lang);
  }

</script>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-6xl mx-auto px-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900">{$t.settings.title}</h1>
    </div>

    {#if savedMessage}
      <div class="alert alert-success mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{$t.common.save} ✓</span>
      </div>
    {/if}

    <!-- Language Settings -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{$t.settings.languageSettings}</h2>
      
      <div class="form-control w-full max-w-md">
        <label class="label">
          <span class="label-text text-lg font-semibold">{$t.settings.selectLanguage}</span>
        </label>
        <div class="flex gap-4">
          <label class="label cursor-pointer gap-3 border-2 rounded-lg px-6 py-4 hover:bg-gray-50 transition-colors"
                 class:border-blue-600={$currentLanguage === "de"}
                 class:bg-blue-50={$currentLanguage === "de"}>
            <input 
              type="radio" 
              class="radio radio-primary" 
              checked={$currentLanguage === "de"}
              on:change={() => changeLanguage("de")}
            />
            <span class="label-text font-semibold text-lg">🇩🇪 Deutsch</span>
          </label>
          
          <label class="label cursor-pointer gap-3 border-2 rounded-lg px-6 py-4 hover:bg-gray-50 transition-colors"
                 class:border-blue-600={$currentLanguage === "en"}
                 class:bg-blue-50={$currentLanguage === "en"}>
            <input 
              type="radio" 
              class="radio radio-primary" 
              checked={$currentLanguage === "en"}
              on:change={() => changeLanguage("en")}
            />
            <span class="label-text font-semibold text-lg">🇬🇧 English</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Hourly Rates Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{$t.settings.hourlyRatesTitle}</h2>

      <!-- Rates Table -->
      <div class="overflow-x-auto mb-8">
        <table class="table w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-semibold text-gray-700">{$t.settings.rateType}</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-700">{$t.settings.ratePerHour}</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">{$t.settings.defaultRate}</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-700">{$t.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {#each hourlyRates as rate (rate.rateID)}
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 font-medium text-gray-900">{rate.rateType}</td>
                <td class="py-3 px-4 text-gray-700">{rate.hourlyRate} CHF/h</td>
                <td class="py-3 px-4 text-center">
                  <input
                    type="radio"
                    name="default-rate"
                    class="radio radio-primary"
                    checked={rate.isDefault}
                    on:change={() => setDefault(rate.rateID)}
                  />
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    class="btn btn-sm btn-error btn-outline"
                    on:click={() => deleteRate(rate.rateID)}
                    disabled={hourlyRates.length === 1}
                  >
                    {$t.common.delete}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Add New Rate -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{$t.settings.addRate}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">{$t.settings.rateType}</span>
            </label>
            <input
              type="text"
              class="input input-bordered w-full"
              bind:value={newRateType}
              placeholder={$currentLanguage === "de" ? "z.B. SystemEngineer" : "e.g. SystemEngineer"}
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">{$t.settings.ratePerHour}</span>
            </label>
            <input
              type="number"
              class="input input-bordered w-full"
              bind:value={newRateAmount}
              placeholder="140"
              min="0"
              step="10"
            />
          </div>
        </div>

        <button class="btn btn-primary" on:click={addRate}>
          {$t.settings.addRate}
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 justify-center">
      <button class="btn btn-success btn-lg" on:click={saveRates}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {$t.common.save}
      </button>
      
      <button class="btn btn-neutral" on:click={resetToDefaults}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset to Defaults
      </button>
    </div>
  </div>
</div>
