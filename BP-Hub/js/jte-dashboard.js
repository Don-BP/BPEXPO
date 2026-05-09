// JTE Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Check
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = auth.getCurrentUser();
    if (user.role !== 'jte') {
        alert('Access Denied: This page is for JTEs only.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userWelcome').textContent = `Welcome, ${user.username}`;

    // 2. Load Connected ALTs
    loadConnectedALTs();
});

async function loadConnectedALTs() {
    const loading = document.getElementById('loading');
    const altList = document.getElementById('altList');

    try {
        // This endpoint logic was added to the backend in collaboration.js
        const response = await auth.apiRequest('/collaboration/teachers');
        const alts = response.teachers || [];

        loading.style.display = 'none';

        if (alts.length === 0) {
            altList.innerHTML = `
                <div class="col-12 text-center text-muted">
                    <i class="bi bi-person-x display-4"></i>
                    <p class="mt-3">No ALTs connected yet.<br>Ask your ALT to add you using your ID: <strong>${auth.getCurrentUser().employeeId}</strong></p>
                </div>
            `;
            altList.style.display = 'flex';
            return;
        }

        altList.innerHTML = alts.map(alt => `
            <div class="col-md-4 col-lg-3">
                <div class="card h-100 teacher-card shadow-sm" onclick="loadPlansForAlt('${alt.id}', '${alt.username}')">
                    <div class="card-body text-center py-4">
                        <div class="mb-3">
                            ${alt.avatarUrl
                ? `<img src="${alt.avatarUrl}" class="rounded-circle" width="80" height="80" style="object-fit:cover">`
                : `<div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" style="width:80px; height:80px">
                                     <span class="fs-1">👤</span>
                                   </div>`
            }
                        </div>
                        <h5 class="card-title text-primary">${alt.username}</h5>
                        <p class="card-text text-muted small">${alt.email}</p>
                        <button class="btn btn-sm btn-outline-primary mt-2">View Plans</button>
                    </div>
                </div>
            </div>
        `).join('');

        altList.style.display = 'flex';

    } catch (error) {
        console.error('Error loading ALTs:', error);
        loading.innerHTML = '<p class="text-danger">Error loading data. Please refresh.</p>';
    }
}

async function loadPlansForAlt(altId, altName) {
    // UI Transition
    document.getElementById('altList').style.display = 'none';
    const plansSection = document.getElementById('plansSection');
    const plansList = document.getElementById('plansList');
    document.getElementById('selectedAltName').textContent = `Lesson Plans from ${altName}`;

    plansList.innerHTML = '<div class="p-4 text-center"><div class="spinner-border text-primary"></div></div>';
    plansSection.style.display = 'block';

    try {
        const response = await auth.apiRequest(`/collaboration/plans/${altId}`);
        const plans = response.plans || [];

        if (plans.length === 0) {
            plansList.innerHTML = '<div class="p-4 text-center text-muted">No lesson plans shared yet.</div>';
            return;
        }

        plansList.innerHTML = plans.map(plan => `
            <a href="lesson-plan.html?id=${plan.id}&mode=jte" class="list-group-item list-group-item-action plan-item p-3">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1 text-primary">${plan.title}</h5>
                    <small class="text-muted">${new Date(plan.createdAt).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">Target: ${plan.target_language || 'N/A'}</p>
                <small class="text-muted">Grade: ${plan.grade_level || 'N/A'}</small>
            </a>
        `).join('');

    } catch (error) {
        console.error('Error loading plans:', error);
        plansList.innerHTML = '<div class="p-3 text-danger">Failed to load plans.</div>';
    }
}

function resetView() {
    document.getElementById('plansSection').style.display = 'none';
    document.getElementById('altList').style.display = 'flex';
}