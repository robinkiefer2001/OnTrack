<script lang="ts">
	import type { HourlyRate } from "$lib/models/project";
	import {
		DEFAULT_HOURLY_RATES,
		loadHourlyRates,
		saveHourlyRates,
	} from "$lib/models/hourlyRates";
	import { t, currentLanguage } from "$lib/language";

	let hourlyRates: HourlyRate[] = loadHourlyRates();
	let newRateType = "";
	let newRateAmount = 0;
	let savedMessage = false;

	function addRate() {
		if (!newRateType.trim() || newRateAmount <= 0) return;

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
		if (hourlyRates.length <= 1) return;
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
		hourlyRates = DEFAULT_HOURLY_RATES;
		saveHourlyRates(hourlyRates);
		savedMessage = true;
		setTimeout(() => {
			savedMessage = false;
		}, 3000);
	}
</script>

<div class="min-h-screen bg-white py-8">
	<div class="max-w-6xl mx-auto px-6">

		{#if savedMessage}
			<div class="alert alert-success mb-6">
				<span>{$t.common.save} ✓</span>
			</div>
		{/if}

		<div class="bg-white rounded-4xl shadow-sm border border-gray-200 p-6 mb-6">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">{$t.settings.hourlyRatesTitle}</h2>

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
										class="btn btn-sm rounded-4xl btn-error btn-outline"
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

			<div class="border-t border-gray-200 pt-6">
				<h3 class="text-xl font-bold text-gray-900 mb-4">{$t.settings.addRate}</h3>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div class="form-control w-full">
						<div class="label">
							<span class="label-text font-semibold">{$t.settings.rateType}</span>
						</div>
						<input
							type="text"
							class="input input-bordered w-full"
							bind:value={newRateType}
							placeholder={$currentLanguage === "de" ? "z.B. SystemEngineer" : "e.g. SystemEngineer"}
						/>
					</div>

					<div class="form-control w-full">
						<div class="label">
							<span class="label-text font-semibold">{$t.settings.ratePerHour}</span>
						</div>
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

				<button class="btn btn-neutral rounded-4xl" on:click={addRate}>
					{$t.settings.addRate}
				</button>
                
			</div>
		</div>

		<div class="flex gap-4 justify-center">
			<button class="btn btn-primary btn-lg" on:click={saveRates}>
				{$t.common.save}
			</button>
			<button class="btn btn-neutral" on:click={resetToDefaults}>
				{$currentLanguage === "de" ? "Auf Standard zurücksetzen" : "Reset to Defaults"}
			</button>
		</div>
	</div>
</div>
