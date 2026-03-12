<script lang="ts">
	import { customerEmployeeList, customerList, projectList } from "$lib/modules/projects/dataSource.mock";
	import type { Customer } from "$lib/modules/projects/contracts";
	import { t } from "$lib/language";

	let searchText = $state("");
	let selectedCustomerId = $state<number | null>(null);

	type TeamMemberProfile = {
		fullName: string;
		department: string | null;
		jobTitle: string | null;
		email: string;
	};

	function getAssignedPeople(projectsForCustomer: typeof $projectList): string[] {
		const names = new Set<string>();
		for (const project of projectsForCustomer) {
			if (project.projectManager?.trim()) names.add(project.projectManager.trim());
			for (const task of project.Tasks || []) {
				if (task.assignedTo?.trim()) names.add(task.assignedTo.trim());
				for (const subtask of task.subtasks || []) {
					if (subtask.assignedTo?.trim()) names.add(subtask.assignedTo.trim());
				}
			}
		}
		return Array.from(names).sort((a, b) => a.localeCompare(b));
	}

	let internalTeamDirectory = $derived.by(() => {
		const map = new Map<string, TeamMemberProfile>();
		for (const employee of customerEmployeeList) {
			const fullName = `${employee.firstName} ${employee.lastName}`.trim();
			if (!map.has(fullName)) {
				map.set(fullName, {
					fullName,
					department: employee.department,
					jobTitle: employee.jobTitle,
					email: employee.email,
				});
			}
		}
		return Array.from(map.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
	});

	let customerMetrics = $derived.by(() =>
		customerList.map((customer) => {
			const projectsForCustomer = $projectList.filter((project) => project.customerID === customer.customerID);
			const assignedTeam = getAssignedPeople(projectsForCustomer);
			const employeeCount = assignedTeam.length;
			const projectCount = projectsForCustomer.length;

			return {
				customer,
				employeeCount,
				projectCount,
				assignedTeam,
			};
		})
	);

	let filteredCustomers = $derived.by(() => {
		const q = searchText.trim().toLowerCase();
		if (!q) return customerMetrics;

		return customerMetrics.filter(({ customer }) =>
			[
				customer.companyName,
				customer.contactName,
				customer.email,
				customer.phone,
				String(customer.zip),
			]
				.join(" ")
				.toLowerCase()
				.includes(q)
		);
	});

	let totalCustomers = $derived(customerList.length);
	let totalEmployees = $derived(internalTeamDirectory.length);
	let totalProjects = $derived($projectList.length);
	let avgProjectsPerCustomer = $derived(totalCustomers === 0 ? 0 : totalProjects / totalCustomers);

	let selectedCustomerData = $derived.by(() => {
		if (selectedCustomerId == null) return null;

		return customerMetrics.find(({ customer }) => customer.customerID === selectedCustomerId) ?? null;
	});

	let selectedCustomerEmployees = $derived.by(() => {
		if (!selectedCustomerData) return [];
		const assigned = new Set(selectedCustomerData.assignedTeam);
		return internalTeamDirectory.filter((employee) => assigned.has(employee.fullName));
	});

	let selectedCustomerProjects = $derived.by(() => {
		if (!selectedCustomerData) return [];

		return $projectList.filter((project) => project.customerID === selectedCustomerData.customer.customerID);
	});

	function selectCustomer(customer: Customer) {
		selectedCustomerId = customer.customerID;
	}
</script>

<div class="min-h-screen bg-gray-50 font-sans">
	<div class="mx-auto flex max-w-7xl flex-col gap-6 p-6">

		<section class="overflow-hidden rounded-4xl border border-gray-200 bg-white shadow-sm">
			<div class="p-6 lg:p-8">
				<p class="text-sm uppercase tracking-[0.24em] text-blue-600">{$t.nav.customers}</p>
				<h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">{$t.customers.title}</h1>
				<p class="mt-1 text-sm text-gray-500">{filteredCustomers.length} / {totalCustomers}</p>
			</div>
		</section>

		<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			<article class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
				<p class="text-sm font-medium text-gray-500">{$t.customers.title}</p>
				<p class="mt-2 text-4xl font-bold text-gray-900">{totalCustomers}</p>
			</article>

			<article class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
				<p class="text-sm font-medium text-gray-500">{$t.nav.employees}</p>
				<p class="mt-2 text-4xl font-bold text-blue-700">{totalEmployees}</p>
			</article>

			<article class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
				<p class="text-sm font-medium text-gray-500">{$t.nav.projects}</p>
				<p class="mt-2 text-4xl font-bold text-green-700">{totalProjects}</p>
			</article>

			<article class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
				<p class="text-sm font-medium text-gray-500">Ø {$t.nav.projects}</p>
				<p class="mt-2 text-4xl font-bold text-gray-900">{avgProjectsPerCustomer.toFixed(1)}</p>
			</article>
		</section>

		<section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
			<article class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<h2 class="text-xl font-semibold text-gray-900">{$t.customers.title}</h2>
					<input
						type="search"
						placeholder={$t.common.search}
						bind:value={searchText}
						class="w-56 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-blue-300 focus:bg-white"
					/>
				</div>

				{#if filteredCustomers.length > 0}
					<div class="mt-5 max-h-160 space-y-2 overflow-y-auto pr-1">
						{#each filteredCustomers as row (row.customer.customerID)}
							{@const active = selectedCustomerId === row.customer.customerID}
							<button
								onclick={() => selectCustomer(row.customer)}
								class={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"}`}
							>
								<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<p class="text-base font-semibold text-gray-900">{row.customer.companyName}</p>
										<p class="mt-1 text-sm text-gray-500">{row.customer.contactName}</p>
									</div>
									<div class="flex flex-wrap gap-2">
										<span class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
											{row.employeeCount} {$t.nav.employees}
										</span>
										<span class="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
											{row.projectCount} {$t.nav.projects}
										</span>
									</div>
								</div>
								<div class="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
									<p class="truncate">{row.customer.email}</p>
									<p>{row.customer.phone}</p>
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="mt-5 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
						{$t.common.search}
					</div>
				{/if}
			</article>

			<article class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
				{#if selectedCustomerData}
					<div>
						<h2 class="text-xl font-semibold text-gray-900">{selectedCustomerData.customer.companyName}</h2>
						<p class="mt-1 text-sm text-gray-500">{$t.customers.contactPerson}: {selectedCustomerData.customer.contactName}</p>

						<div class="mt-4 grid gap-3 sm:grid-cols-2">
							<div class="rounded-2xl bg-gray-50 p-4">
								<p class="text-xs uppercase tracking-[0.15em] text-gray-400">{$t.customers.email}</p>
								<p class="mt-1 text-sm font-medium text-gray-800">{selectedCustomerData.customer.email}</p>
							</div>
							<div class="rounded-2xl bg-gray-50 p-4">
								<p class="text-xs uppercase tracking-[0.15em] text-gray-400">{$t.customers.phone}</p>
								<p class="mt-1 text-sm font-medium text-gray-800">{selectedCustomerData.customer.phone}</p>
							</div>
							<div class="rounded-2xl bg-gray-50 p-4">
								<p class="text-xs uppercase tracking-[0.15em] text-gray-400">ZIP</p>
								<p class="mt-1 text-sm font-medium text-gray-800">{selectedCustomerData.customer.zip}</p>
							</div>
							<div class="rounded-2xl bg-gray-50 p-4">
								<p class="text-xs uppercase tracking-[0.15em] text-gray-400">{$t.nav.projects}</p>
								<p class="mt-1 text-sm font-medium text-gray-800">{selectedCustomerData.projectCount}</p>
							</div>
						</div>

						<div class="mt-5">
							<h3 class="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">{$t.nav.employees} (Assigned Team)</h3>
							<div class="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
								{#each selectedCustomerEmployees as employee (employee.fullName)}
									<div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
										<p class="text-sm font-medium text-gray-900">{employee.fullName}</p>
										<p class="text-xs text-gray-500">{employee.department || "-"} · {employee.jobTitle || "-"}</p>
									</div>
								{/each}
								{#if selectedCustomerEmployees.length === 0}
									<p class="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-500">No assigned employees yet.</p>
								{/if}
							</div>
						</div>

						<div class="mt-5">
							<h3 class="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">{$t.nav.projects}</h3>
							<div class="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
								{#each selectedCustomerProjects as project (project.projectID)}
									<div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
										<p class="text-sm font-medium text-gray-900">{project.title}</p>
										<p class="text-xs text-gray-500">{project.projectManager}</p>
									</div>
								{/each}
								{#if selectedCustomerProjects.length === 0}
									<p class="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-500">{$t.home.noProjects}</p>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<div class="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-500">
						{$t.customers.title}
					</div>
				{/if}
			</article>
		</section>
	</div>
</div>
