// Portfolio Data Loader for v1 pages
(async function() {
    try {
        // Fetch from static JSON file instead of API
        const response = await fetch('/v1/portfolio-data.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch portfolio data: ${response.status}`);
        }
        const portfolio = await response.json();
        
        // Helper function to update text content
        function updateText(selector, text) {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = text;
            }
        }
        
        // Helper function to update HTML content
        function updateHTML(selector, html) {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = html;
            }
        }
        
        // Helper function to update attribute
        function updateAttr(selector, attr, value) {
            const element = document.querySelector(selector);
            if (element) {
                element.setAttribute(attr, value);
            }
        }
        
        // Update name
        updateText('[data-portfolio="name"]', portfolio.personalInfo.name);
        updateText('[data-portfolio="name-pronunciation"]', `Enise "${portfolio.personalInfo.pronunciation}"`);
        
        // Update title text (for window title bar)
        const titleText = portfolio.personalInfo.name.toLowerCase().replace(/\s+/g, '-') + '.homepage';
        updateText('[data-portfolio="title-text"]', titleText);
        
        // Update title
        const titleElement = document.querySelector('title[data-portfolio="title"]');
        if (titleElement) {
            // Check page type and update title accordingly
            const currentTitle = titleElement.textContent || '';
            if (currentTitle.includes('Resume') || document.location.pathname.includes('resume')) {
                titleElement.textContent = `Resume - ${portfolio.personalInfo.name}`;
            } else if (currentTitle.includes('Contact') || document.location.pathname.includes('contact')) {
                titleElement.textContent = `Contact - ${portfolio.personalInfo.name}`;
            } else if (currentTitle.includes('Projects') || document.location.pathname.includes('projects')) {
                titleElement.textContent = `Projects - ${portfolio.personalInfo.name}`;
            } else {
                titleElement.textContent = `${portfolio.personalInfo.name} - Portfolio`;
            }
        } else {
            const titleTag = document.querySelector('title');
            if (titleTag) {
                // Check page type and update title accordingly
                const currentTitle = titleTag.textContent || '';
                if (currentTitle.includes('Resume') || document.location.pathname.includes('resume')) {
                    titleTag.textContent = `Resume - ${portfolio.personalInfo.name}`;
                } else if (currentTitle.includes('Contact') || document.location.pathname.includes('contact')) {
                    titleTag.textContent = `Contact - ${portfolio.personalInfo.name}`;
                } else if (currentTitle.includes('Projects') || document.location.pathname.includes('projects')) {
                    titleTag.textContent = `Projects - ${portfolio.personalInfo.name}`;
                } else {
                    titleTag.textContent = `${portfolio.personalInfo.name} - Portfolio`;
                }
            }
        }
        
        // Update role
        updateText('[data-portfolio="role"]', portfolio.personalInfo.role);
        updateText('[data-portfolio="subtitle"]', portfolio.personalInfo.role);
        
        // Update location
        const locationPrimary = portfolio.personalInfo.location.primary.replace(' 🇩🇪', '').replace(' 🇹🇷', '');
        const locationSecondary = portfolio.personalInfo.location.secondary.replace(' 🇩🇪', '').replace(' 🇹🇷', '');
        updateHTML('[data-portfolio="location"]', `${locationPrimary}<br>${locationSecondary}`);
        updateText('[data-portfolio="location-inline"]', `${locationPrimary} • ${locationSecondary}`);
        
        // Update email
        updateAttr('[data-portfolio="email"]', 'href', `mailto:${portfolio.personalInfo.email}`);
        updateText('[data-portfolio="email-text"]', portfolio.personalInfo.email);
        
        // Update social links
        updateAttr('[data-portfolio="github"]', 'href', portfolio.socialLinks.github);
        updateAttr('[data-portfolio="linkedin"]', 'href', portfolio.socialLinks.linkedin);
        updateAttr('[data-portfolio="twitter"]', 'href', portfolio.socialLinks.twitter);
        updateAttr('[data-portfolio="substack"]', 'href', portfolio.socialLinks.substack);
        updateAttr('[data-portfolio="medium"]', 'href', portfolio.socialLinks.medium);
        
        // Update bio
        updateHTML('[data-portfolio="bio-full"]', portfolio.bio.full.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>'));
        
        // Update work/current position
        updateText('[data-portfolio="work"]', portfolio.personalInfo.work);
        updateText('[data-portfolio="current-position"]', portfolio.personalInfo.currentPosition);
        
        // Update research interests
        const interestsList = document.querySelector('[data-portfolio="research-interests"]');
        if (interestsList) {
            interestsList.innerHTML = portfolio.researchInterests.map(interest => `<li>${interest}</li>`).join('');
        }
        
        // Update currently reading
        const readingList = document.querySelector('[data-portfolio="currently-reading"]');
        if (readingList) {
            readingList.innerHTML = portfolio.currentlyReading.map(paper => 
                `<li><a href="${paper.url}" target="_blank">${paper.title}</a></li>`
            ).join('');
        }
        
        // Update system info
        portfolio.systemInfo.forEach((info, index) => {
            const systemRow = document.querySelector(`[data-portfolio="system-info-${index}"]`);
            if (systemRow) {
                const contentDiv = systemRow.querySelector('div:last-child');
                if (contentDiv) {
                    contentDiv.textContent = `${info.label}: ${info.value}`;
                } else {
                    systemRow.innerHTML = `<div class="system-icon">${info.icon}</div><div>${info.label}: ${info.value}</div>`;
                }
            }
        });
        
        // Update footer
        updateText('[data-portfolio="footer-tagline"]', portfolio.footer.tagline);
        updateText('[data-portfolio="footer-copyright"]', portfolio.footer.copyright);
        
        // Update timezones
        if (portfolio.personalInfo.timezone && portfolio.personalInfo.timezone.length > 0) {
            updateText('[data-portfolio="timezones"]', portfolio.personalInfo.timezone.join(' • '));
        }
        
        // Update collaboration interests
        const collaborationList = document.querySelector('[data-portfolio="collaboration-interests"]');
        if (collaborationList && portfolio.collaborationInterests && portfolio.collaborationInterests.length > 0) {
            collaborationList.innerHTML = portfolio.collaborationInterests.map(interest => `
                <div class="interest-item">
                    <div class="interest-icon">${interest.icon}</div>
                    <div>
                        <h4>${interest.title}</h4>
                        <p>${interest.description}</p>
                    </div>
                </div>
            `).join('');
        }
        
        // Update education
        const educationList = document.querySelector('[data-portfolio="education-list"]');
        if (educationList && portfolio.education && portfolio.education.length > 0) {
            educationList.innerHTML = portfolio.education.map(edu => `
                <div class="education-item">
                    <div class="edu-header">
                        <div>
                            <h3>${edu.degree}</h3>
                            <p class="institution">${edu.institution}</p>
                        </div>
                        <div class="duration">${edu.years}</div>
                    </div>
                    <div style="color: #666; font-size: 14px; margin-bottom: 8px;">📍 ${edu.location}</div>
                    ${edu.status ? `<div style="color: #666; font-size: 13px; margin-bottom: 8px;"><strong>Status:</strong> ${edu.status}</div>` : ''}
                    ${edu.description ? `<div style="color: #666; font-size: 14px; margin-top: 8px; font-style: italic;">${edu.description}</div>` : ''}
                </div>
            `).join('');
        }
        
        // Legacy support for individual education fields (if they exist)
        if (portfolio.education && portfolio.education.length > 0) {
            const firstEducation = portfolio.education[0];
            updateText('[data-portfolio="education-degree"]', firstEducation.degree);
            updateText('[data-portfolio="education-institution"]', firstEducation.institution);
            updateText('[data-portfolio="education-location"]', `📍 ${firstEducation.location}`);
        }
        
        // Update experience
        const experienceList = document.querySelector('[data-portfolio="experience-list"]');
        if (experienceList && portfolio.experience && portfolio.experience.length > 0) {
            experienceList.innerHTML = portfolio.experience.map(exp => `
                <div class="experience-item">
                    <div class="exp-header">
                        <div>
                            <h3>${exp.title}</h3>
                            <p class="company">${exp.company}</p>
                        </div>
                        <div class="duration">${exp.period}</div>
                    </div>
                    ${exp.location ? `<div style="color: #666; font-size: 14px; margin-bottom: 8px;">📍 ${exp.location}</div>` : ''}
                    ${exp.focus ? `<div class="focus-area"><strong>Focus:</strong> ${exp.focus}</div>` : ''}
                    ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                        <ul class="responsibilities">
                            ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('');
        }
        
        // Legacy support for individual experience fields (if they exist)
        if (portfolio.experience && portfolio.experience.length > 0) {
            const firstExp = portfolio.experience[0];
            updateText('[data-portfolio="experience-title"]', firstExp.title);
            updateText('[data-portfolio="experience-company"]', firstExp.company);
            updateText('[data-portfolio="experience-period"]', firstExp.period);
        }
        
        // Update projects
        function renderProject(project) {
            const statusClass = project.status === 'Ongoing' ? 'in-progress' : 
                               project.status === 'Completed' ? 'completed' : 
                               project.status === 'Confidential' ? 'confidential' : '';
            const statusHtml = project.status ? `<strong>Status:</strong> <span class="status ${statusClass}">${project.status}</span><br>` : '';
            const yearHtml = project.year ? `<strong>Year:</strong> ${project.year}<br>` : '';
            const impactHtml = project.impact ? `<strong>Impact:</strong> ${project.impact}<br>` : '';
            const builtWithHtml = project.builtWith ? `<strong>Built with:</strong> ${project.builtWith}<br>` : '';
            
            let linksHtml = '';
            if (project.links) {
                if (project.links.github) {
                    linksHtml += `<a href="${project.links.github}" class="project-link" target="_blank">💻 GitHub</a>`;
                }
                if (project.links.results) {
                    linksHtml += `<a href="${project.links.results}" class="project-link" target="_blank">📈 Results</a>`;
                }
                if (project.links.paper) {
                    linksHtml += `<a href="${project.links.paper}" class="project-link" target="_blank">📄 Paper</a>`;
                }
            }
            if (project.status === 'Confidential') {
                linksHtml = '<span class="confidential">🔒 Confidential</span>';
            }
            
            const techHtml = project.tech ? project.tech.join(', ') : '';
            
            // Extract emoji from title if present
            const titleMatch = project.title.match(/^([^\s]+)\s+(.+)$/);
            const emoji = titleMatch ? titleMatch[1] : project.icon || '📁';
            const titleText = titleMatch ? titleMatch[2] : project.title;
            
            return `
                <div class="project-folder">
                    <div class="folder-header">
                        <span class="folder-icon">${emoji}</span>
                        <span class="folder-title">${titleText}</span>
                    </div>
                    <div class="folder-desc">
                        ${project.description}
                        <br><br>
                        <strong>Tech:</strong> ${techHtml}
                        ${yearHtml ? '<br>' + yearHtml : ''}
                        ${statusHtml ? '<br>' + statusHtml : ''}
                        ${impactHtml ? '<br>' + impactHtml : ''}
                        ${builtWithHtml ? '<br>' + builtWithHtml : ''}
                        ${linksHtml ? '<div class="project-links">' + linksHtml + '</div>' : ''}
                    </div>
                </div>
            `;
        }
        
        // Professional projects
        const professionalContainer = document.querySelector('[data-portfolio="projects-professional"]');
        if (professionalContainer && portfolio.projects && portfolio.projects.professional) {
            professionalContainer.innerHTML = portfolio.projects.professional.map(renderProject).join('');
        }
        
        // Academic projects
        const academicContainer = document.querySelector('[data-portfolio="projects-academic"]');
        if (academicContainer && portfolio.projects && portfolio.projects.academic) {
            academicContainer.innerHTML = portfolio.projects.academic.map(renderProject).join('');
        }
        
        // Personal projects
        const personalContainer = document.querySelector('[data-portfolio="projects-personal"]');
        if (personalContainer && portfolio.projects && portfolio.projects.personal) {
            personalContainer.innerHTML = portfolio.projects.personal.map(renderProject).join('');
        }
        
        // Research projects
        const researchContainer = document.querySelector('[data-portfolio="projects-research"]');
        if (researchContainer && portfolio.projects && portfolio.projects.research) {
            researchContainer.innerHTML = portfolio.projects.research.map(renderProject).join('');
        }
        
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
})();

