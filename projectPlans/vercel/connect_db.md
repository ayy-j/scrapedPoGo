Link an existing Neon project to Vercel and keep billing in Neon

### What you will learn:

- [The purpose of the Neon-Managed Integration](https://neon.com/docs/guides/#about-this-integration)
- [How to install it from Connectable Accounts](https://neon.com/docs/guides/#installation-steps)
- [How automated Preview Branching works](https://neon.com/docs/guides/#how-preview-branching-works)
- [How to manage environment variables and branch cleanup](https://neon.com/docs/guides/#managing-the-integration)

### Related topics

- [Vercel-Managed Integration](https://neon.tech/unify?a=86a2c1be-c732-4f9f-9734-5c01e15548b2&n=docs/guides/vercel-managed-integration)
- [Manual Connections](https://neon.tech/unify?a=86a2c1be-c732-4f9f-9734-5c01e15548b2&n=docs/guides/vercel-manual)

---

## About this integrationThe **Neon-Managed Integration** links your existing Neon project to a Vercel project while keeping billing in Neon. Instead of sharing a single database across all preview deployments, this integration creates an isolated database branch for each preview deployment.

**Key features:**

- One-click connection from Vercel Marketplace
- Automatic database branches for each preview deployment
- Environment variable injection (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PG*` variables)
- Automatic cleanup when branches are deleted

#### Who should use this integration?

Choose the Neon-Managed Integration if you already have a Neon account/project or prefer to manage billing directly with Neon.

---

## PrerequisitesBefore you begin, ensure you have:

- A Neon account with at least one project and database role
- A Vercel account with a project linked to GitHub, GitLab, or Bitbucket

---

## Installation steps1. ## Connect from Neon Console	In the [Neon Console](https://console.neon.tech/), navigate to **Integrations** and click **Add** under Vercel.
	Click **Install from Vercel Marketplace** to open the integration in Vercel.
2. ## Add the integration in Vercel	On the Vercel page, click **Install**.
	This opens the **Install Neon** modal where you can choose between two options. Select **Link Existing Neon Account**, then click **Continue**.
	![Install on Existing Neon Account](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_install_neon_modal_existing_account.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)
	#### tip
	Alternatively, if you're accessing this directly from the Vercel Marketplace, locate the **Connectable Accounts** section, find **Neon**, and click **Add**. This differs from the **Native Integrations** section in the Vercel Marketplace.
	![Add Neon from Connectable Accounts](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_add_connected_neon_account.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)
3. ## Configure the connection	Choose which Vercel account and projects can use this integration. Each Neon project connects to exactly one Vercel project. Selecting **All projects** makes the integration available to other Vercel projects.
	![Connect Neon Account Projects](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_connect_neon_account_projects.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)
4. ## Set up project integration	In the **Integrate Neon** dialog:
	1. **Select your Vercel project**
		![Select a Vercel project](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_select_project.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)
	2. **Choose your Neon project, database, and role**
		![Connect to Neon](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_connect_neon.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)
	3. **Configure optional settings:**
		- Enable **Create a branch for your development environment** to create a persistent `vercel-dev` branch and set Vercel development environment variables for it. The `vercel-dev` branch is a clone of your project's default branch (`main`) that you can modify without affecting data on your default branch.
		- Enable **Automatically delete obsolete Neon branches** (recommended) to clean up branches when git branches are deleted.
	4. Click **Connect**, then **Done**
	![Confirm integration settings](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_confirm_settings.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)
	![Vercel integration success](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_success.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

### What happens after installationOnce connected successfully, you'll see:

**In Neon Console:**

- A `vercel-dev` branch (if enabled) under **Branches**
- Future preview branches will appear here automatically

![Neon branches](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_neon_branches.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

**In Vercel:**

- `DATABASE_URL` and other environment variables under **Settings → Environment Variables**

![Vercel environment variables](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_env_variables.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

---

## How Preview Branching worksThe integration automatically creates isolated database environments for each preview deployment:

#### Neon Auth support for preview deployments

If you've enabled [Neon Auth](https://neon.tech/unify?a=86a2c1be-c732-4f9f-9734-5c01e15548b2&n=docs/auth/overview) on your production branch, it's automatically provisioned on preview branches too. Preview deployments receive `NEON_AUTH_BASE_URL` and `VITE_NEON_AUTH_URL` environment variables, letting you test authentication in isolated environments. Auth data branches with your database, so each preview has its own independent user profiles and sessions.

1. ## Developer pushes to feature branch	When you push commits to a feature branch, Vercel triggers a preview deployment.
2. ## Integration creates Neon branch	The integration receives a webhook from Vercel and creates a new Neon branch named `preview/<git-branch>` using the Neon API.
3. ## Environment variables injected	Vercel receives the new connection string and injects it as environment variables for that specific deployment only.

This isolation allows you to test data and schema changes safely in each pull request. To apply schema changes automatically, add migration commands to your Vercel build configuration:

1. Go to **Vercel Dashboard → Settings → Build and Deployment Settings**
2. Enable **Override** and add your build commands, including migrations, for example:
	```
	npx prisma migrate deploy && npm run build
	```

This ensures schema changes in your commits are applied to each preview deployment's database branch.

![Vercel build commands](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_build_command.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

![Neon preview deployment branch](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_deployments.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

![Neon preview deployment branch](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_neon_app_update.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

![Vercel preview settings](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_preview_settings.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

---

## Managing the integration### Environment variablesThe integration sets both modern (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`) and legacy PostgreSQL variables (`POSTGRES_URL`, `PGHOST`, etc.) for Production and Development environments. Preview variables are injected dynamically per deployment.

- `DATABASE_URL`: Pooled connection (recommended for most applications)
- `DATABASE_URL_UNPOOLED`: Direct connection (for tools requiring direct database access)
- `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`: Neon Auth endpoints (automatically set when Neon Auth is enabled on production branch)

**To customize which variables are used:**

1. Go to **Neon Console → Integrations → Manage → Settings**
2. Select the variables you want (e.g., `PGHOST`, `PGUSER`, etc.)
3. Click **Save changes**

![Select Vercel variables](https://neon.com/_next/image?url=%2Fdocs%2Fguides%2Fvercel_select_variables.png&w=1920&q=75&dpl=dpl_3ZWmPaVnJYBmpC6RJ8Q8ZB34dT2j)

### Branch cleanup**Automatic cleanup (recommended):** Enable **Automatically delete obsolete Neon branches** during setup to remove preview branches automatically when the corresponding Git branch is deleted.

#### note

This Git-branch-based cleanup differs from the [Vercel-Managed Integration](https://neon.tech/unify?a=86a2c1be-c732-4f9f-9734-5c01e15548b2&n=docs/guides/vercel-managed-integration), which deletes branches when deployments are deleted (either manually or automatically via Vercel's retention policies).

**Manual cleanup:** If needed, you can delete branches manually:

- **Individual branches:** Neon Console → Integrations → Manage → Branches → trash icon
- **Bulk delete:** Use **Delete all** in the same interface
- **API/CLI:** Use Neon CLI or API for programmatic cleanup

#### Important cleanup considerations

- **Don't rename branches:** Renaming either the Git branch or Neon branch breaks name-matching logic and may cause unintended deletions
- **Avoid child branches:** Creating child branches on preview branches prevents automatic deletion
- **Role dependency:** The integration depends on the selected role - removing it will break the integration

### Disconnect integrationTo disconnect the integration: **Neon Console → Integrations → Manage → Disconnect**. This stops creating new preview branches but doesn't remove existing branches or the integration from Vercel.

---

## Limitations- **One-to-one relationship:** Each Neon project connects to exactly one Vercel project
- **Integration exclusivity:** Cannot coexist with the Vercel-Managed Integration in the same Vercel project
- **Role dependency:** Integration requires the selected PostgreSQL role to remain active

---

## Next steps## After Installation

0%

- ### [Test preview branching](https://neon.com/docs/guides/#how-preview-branching-works)
	Create a feature branch and push changes to verify preview deployments work correctly
- ### [Configure build commands](https://neon.com/docs/guides/#how-preview-branching-works)
	Add migration commands to Vercel's build settings if using an ORM like Prisma
- ### [Set up branch cleanup](https://neon.com/docs/guides/#branch-cleanup)
	Enable automatic cleanup or establish a manual cleanup process
- ### [Customize environment variables](https://neon.com/docs/guides/#environment-variables)
	Review and adjust which database variables are injected into your deployments

---

## Troubleshooting### Environment variable conflictsIf you see "Failed to set environment variables" during setup, remove conflicting variables in Vercel first:

1. Go to **Vercel → Settings → Environment Variables**
2. Remove or rename existing `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGDATABASE`, or `PGPASSWORD` variables
3. Retry the integration setup

### Integration stops working**Issue:** Preview branches no longer created **Cause:** The PostgreSQL role selected during setup was deleted **Solution:** Reinstall the integration with a valid role, or change the role in **Neon Console → Integrations → Manage → Settings**