# CivicBase License FAQ
## AGPL-3.0 Compliance for Swedish Municipalities

This FAQ helps Swedish municipal IT departments understand what the **GNU Affero General Public License v3.0 (AGPL-3.0)** means for CivicBase deployment.

**Short answer:** You can use CivicBase freely. If you modify it, share your improvements so other municipalities benefit.

---

## Quick Reference

| Action | AGPL Requirement | Practical Impact |
|--------|------------------|------------------|
| **Using CivicBase unmodified** | None | Deploy freely in production |
| **Integrating with existing systems** | None | Connect to your databases, APIs, etc. |
| **Running for internal municipal use** | None | No sharing required |
| **Modifying CivicBase code** | Share modifications | Improvements benefit all municipalities |
| **Running as public network service** | Provide source to users | Rare for municipal deployments |
| **Training municipal staff** | None | Train as many people as needed |
| **Hiring consultants to deploy** | None | Normal procurement process |

---

## Common Questions

### 1. Can we use CivicBase without any obligations?

**Yes, if you use it unmodified.**

If your municipality deploys CivicBase exactly as released (even in production, serving thousands of citizens), you have **no sharing obligations**.

**Example:** Upplands Väsby downloads CivicBase v1.0, deploys it for TAK-405 transit wellness system, serves 5,000 users. No code sharing required.

---

### 2. What if we integrate CivicBase with our existing municipal IT systems?

**No problem. Integration is not modification.**

Connecting CivicBase to your existing systems (databases, identity management, payment systems) does **not** trigger AGPL obligations.

**Allowed without sharing:**
- ✅ Connecting to your SQL database
- ✅ Integrating with BankID for authentication
- ✅ Calling CivicBase APIs from your existing web portal
- ✅ Using CivicBase as one component in larger system
- ✅ Storing CivicBase data in your backup infrastructure

**Why?** AGPL applies to CivicBase code itself, not systems that communicate with it via APIs.

**Example:** Stockholm deploys CivicBase for DPOP political organizing, connects it to their existing citizen portal via REST API. Integration code stays private. CivicBase code stays AGPL.

---

### 3. What if we customize CivicBase configuration?

**Configuration is not modification. No sharing required.**

Changing configuration files, environment variables, or runtime settings does **not** trigger AGPL.

**Allowed without sharing:**
- ✅ Changing database connection strings
- ✅ Adjusting cache sizes, timeout values
- ✅ Enabling/disabling features via config
- ✅ Setting municipal branding (logos, colors)
- ✅ Configuring P2P network parameters

**Example:** Region Stockholm configures CivicBase to use their own STUN/TURN servers for NAT traversal, changes log retention to 90 days. No sharing required.

---

### 4. What if we modify CivicBase source code?

**Then you must share your modifications under AGPL.**

If you change CivicBase **source code** and deploy it, you must:
1. Make your modified source code available
2. License it under AGPL-3.0
3. Document what you changed

**Triggers sharing obligation:**
- ⚠️ Fixing bugs in CivicBase core
- ⚠️ Adding new features to CivicBase
- ⚠️ Modifying database schema
- ⚠️ Changing sync algorithms
- ⚠️ Improving P2P networking code

**How to comply:**
1. Fork CivicBase on GitHub
2. Make your changes in your public fork
3. Document modifications in CHANGELOG
4. (Optional) Contribute improvements back via pull request

**Why this is good:** Other Swedish municipalities get your bug fixes and improvements for free. You get their improvements for free. Everyone wins.

**Example:** Göteborg finds a bug in offline sync, fixes it, shares the fix on GitHub. All other municipalities get the fix. Next month, Malmö improves mesh networking, shares it. Göteborg gets that improvement. Shared innovation across Sweden.

---

### 5. What if we hire a consultant to customize CivicBase?

**The consultant must share modifications, or you must.**

When hiring consultants:

**Option A: Consultant shares modifications publicly**
- Consultant modifies CivicBase, deploys in your municipality
- Consultant publishes modified source code on GitHub
- You have no additional obligations

**Option B: You share modifications**
- Consultant modifies CivicBase, gives you the code
- You publish the modified source code
- Consultant has no additional obligations

**Best practice:** Include in procurement: *"All CivicBase modifications must be published on GitHub under AGPL-3.0"*

This ensures compliance and benefits other municipalities.

**Example:** Solna hires a consultant to add Swedish BankID integration to CivicBase. Procurement contract requires: "All source code modifications published on github.com/solna/CivicBase under AGPL-3.0". Consultant complies. Other municipalities can use Solna's BankID integration for free.

---

### 6. What if we run CivicBase as a public-facing network service?

**You must provide source code to your users.**

AGPL's unique requirement: If users interact with CivicBase over a network (not just your internal staff), you must offer them the source code.

**When this applies:**
- ⚠️ Public website where citizens use CivicBase directly
- ⚠️ Mobile app that connects to your CivicBase server
- ⚠️ API that external organizations use

**When this doesn't apply:**
- ✅ Internal municipal staff use only
- ✅ Citizens use your portal, which *calls* CivicBase in background
- ✅ P2P deployment (no "server" to access)

**How to comply:** Add a link in your user interface: *"Source code available at: github.com/yourmunicipality/CivicBase"*

**Example (triggers obligation):** Uppsala runs CivicBase TAK-405 as public web service at tak405.uppsala.se where citizens log in directly. Must provide source link on the website.

**Example (doesn't trigger):** Västerås runs CivicBase internally. Their citizen portal (separate application) makes API calls to CivicBase. Citizens never interact with CivicBase directly. No source code link required.

---

### 7. Can we keep our municipal data private?

**Yes. AGPL applies to code, not data.**

Your municipal data (citizen information, transactions, records) remains **completely private**. AGPL only requires sharing **source code modifications**.

**Private forever:**
- ✅ Citizen data
- ✅ Transaction history  
- ✅ Municipal records
- ✅ Configuration secrets (API keys, passwords)
- ✅ Database contents

**Must share if modified:**
- ⚠️ CivicBase source code changes
- ⚠️ Database schema modifications
- ⚠️ API endpoint additions

**Example:** Linköping deploys CivicBase for elder care coordination. All care records stay private. If Linköping modifies CivicBase code to add GDPR export feature, they share that code (not the care records).

---

### 8. What about vendor lock-in protection?

**This is exactly why we chose AGPL.**

Traditional municipal IT procurement often leads to vendor lock-in:
1. Municipality hires Vendor A to deploy System X
2. Vendor A customizes System X with proprietary code
3. Municipality now depends on Vendor A forever
4. Vendor A raises prices, municipality has no alternative

**AGPL prevents this:**
1. Municipality hires Vendor A to deploy CivicBase
2. Vendor A customizes CivicBase
3. **AGPL requires:** Vendor A must share all modifications
4. Municipality can hire Vendor B to maintain the same system
5. No lock-in. Competitive market.

**This protects taxpayer money and municipal autonomy.**

---

### 9. Can we use CivicBase commercially?

**Yes. AGPL allows commercial use.**

AGPL is **not** anti-commercial. It's anti-lock-in.

**Allowed under AGPL:**
- ✅ Consultants charge for CivicBase deployment
- ✅ Support contracts for ongoing maintenance
- ✅ Training services
- ✅ Custom development (if modifications are shared)
- ✅ Hosting services

**Not allowed:**
- ❌ Taking CivicBase code, making proprietary modifications, selling without sharing

**Example:** IT-Konsult AB offers CivicBase deployment services to Swedish municipalities for 500K SEK including:
- Installation and configuration
- Staff training
- 2-year support contract
- Custom BankID integration (code shared on GitHub)

This is **completely allowed** under AGPL and benefits the ecosystem.

---

### 10. What if we contribute improvements back to CivicBase?

**Highly encouraged, not required.**

While AGPL requires you to **share** your modifications, it doesn't require you to contribute them back to the main CivicBase project.

**You can:**
- Share modifications on your own GitHub fork (compliant)
- Submit improvements as pull requests to main project (better)
- Coordinate with other municipalities on shared features (best)

**Benefits of contributing back:**
- ✅ Your code gets maintained by project team
- ✅ Other municipalities test and improve your code
- ✅ You avoid maintaining a separate fork
- ✅ You get credit in release notes

**Example:** Three municipalities (Umeå, Luleå, Kiruna) all need winter weather resilience features. They coordinate development, share costs (200K each), contribute code to main CivicBase project. All Swedish municipalities benefit.

---

## Compliance Checklist

### For Unmodified Deployment
- [ ] Downloaded CivicBase from official source
- [ ] Using configuration files (not source code changes)
- [ ] Integrated with existing systems via APIs

**Result:** ✅ Fully compliant. No sharing obligations.

### For Modified Deployment
- [ ] Modified source code documented in CHANGELOG
- [ ] Modified source published on public repository (GitHub)
- [ ] Repository clearly labeled as AGPL-3.0
- [ ] Link to source code provided to users (if network service)

**Result:** ✅ Fully compliant. Shared innovation achieved.

### For Procurement
- [ ] RFP includes: *"All CivicBase modifications must be published under AGPL-3.0"*
- [ ] Contract specifies GitHub repository for code sharing
- [ ] Deliverables include source code documentation

**Result:** ✅ Fully compliant. Vendor lock-in prevented.

---

## Real-World Scenarios

### Scenario 1: Standard Deployment
**Municipality:** Upplands Väsby  
**Use Case:** TAK-405 transit wellness (Hearts currency)  
**Action:** Deploy CivicBase v1.0 unmodified, configure for 5,000 users  
**AGPL Obligation:** None  
**Why:** Using software as provided, configuration not modification

---

### Scenario 2: Bug Fix
**Municipality:** Göteborg  
**Use Case:** Found bug in offline sync causing data loss  
**Action:** Fix bug in `src/core/syncManager.js`, deploy patched version  
**AGPL Obligation:** Share bug fix on GitHub  
**How:** Fork github.com/CivicBase/CivicBase, commit fix, publish fork  
**Result:** All municipalities get bug fix for free

---

### Scenario 3: Custom Feature
**Municipality:** Stockholm  
**Use Case:** Need Swedish BankID authentication for DiDiS identity system  
**Action:** Add BankID integration module to CivicBase  
**AGPL Obligation:** Share BankID module on GitHub  
**How:** Create github.com/stockholm/CivicBase-BankID, publish module  
**Result:** Other municipalities can use Stockholm's BankID work

---

### Scenario 4: Consultant Engagement
**Municipality:** Solna  
**Vendor:** IT-Konsult AB  
**Contract:** Deploy CivicBase with Swish payment integration (300K SEK)  
**AGPL Obligation:** IT-Konsult AB must publish Swish integration code  
**How:** Include in contract: *"All source code delivered under AGPL-3.0, published on github.com/solna/CivicBase-Swish"*  
**Result:** Solna compliant, other municipalities get Swish integration

---

### Scenario 5: Internal-Only Use
**Municipality:** Västerås  
**Use Case:** DPOP political organizing for municipal council  
**Action:** Deploy CivicBase for 50 council members (internal only)  
**AGPL Obligation:** None (even if modified)  
**Why:** Internal use, no network service to public  
**Note:** If later opened to citizens, must provide source link

---

### Scenario 6: Multi-Municipal Collaboration
**Municipalities:** Umeå, Luleå, Kiruna  
**Use Case:** Winter resilience features for arctic municipalities  
**Action:** Co-develop mesh networking for 24h polar night scenarios  
**AGPL Obligation:** Share arctic resilience code  
**How:** Create github.com/arctic-municipalities/CivicBase-Arctic  
**Cost:** 200K SEK each, 600K total  
**Result:** All municipalities get arctic features, cost shared 3-ways

---

## When to Consult Legal

AGPL is straightforward for most municipal use cases. Consult legal counsel if:

- ❓ Mixing CivicBase with proprietary software in complex ways
- ❓ Uncertain whether your use case is "network service" or "internal"
- ❓ Vendor refuses to share modifications (probably violating AGPL)
- ❓ Need to sublicense CivicBase (answer: you can't, AGPL prohibits this)

For typical municipal deployments, this FAQ covers 95% of scenarios.

---

## Getting Help

### Technical Questions
**GitHub Discussions:** https://github.com/CivicBase/CivicBase/discussions  
**Email:** bjorn.kenneth.holmstrom@gmail.com

### Legal Questions
**AGPL Official FAQ:** https://www.gnu.org/licenses/gpl-faq.html  
**Swedish Legal Context:** Consult your municipal legal department  
**Free Software Foundation:** https://www.fsf.org/licensing/

### Compliance Support
We provide free compliance assistance for Swedish municipalities:
- Reviewing your deployment for AGPL compliance
- Helping set up GitHub repositories for sharing
- Drafting procurement language for RFPs
- Training municipal IT staff on open source licensing

**Email:** bjorn.kenneth.holmstrom@gmail.com  
**Subject:** "CivicBase AGPL Compliance Assistance"

---

## Summary

**AGPL for municipal IT means:**

✅ **Use freely** - Deploy in production, serve thousands of users  
✅ **Integrate freely** - Connect to all your existing systems  
✅ **Configure freely** - Customize settings without sharing  
⚠️ **Share modifications** - Code changes must be public  
⚠️ **Prevent vendor lock-in** - Consultants can't lock you in  
✅ **Keep data private** - AGPL applies to code, not data  
✅ **Use commercially** - Vendors can charge for services  
✅ **Collaborate across municipalities** - Share development costs

**The goal:** Public infrastructure improvements shared across all Swedish municipalities, preventing vendor lock-in while enabling competitive services market.

---

## Appendix: AGPL vs. Other Licenses

| License | Modifications Must Be Shared? | Network Services Covered? | Vendor Lock-In Risk |
|---------|------------------------------|---------------------------|-------------------|
| **AGPL** | ✅ Yes, if distributed or networked | ✅ Yes | ❌ Low |
| **GPL** | ✅ Yes, if distributed | ❌ No (loophole) | ⚠️ Medium |
| **MIT** | ❌ No | ❌ No | ⚠️ High |
| **Apache 2.0** | ❌ No | ❌ No | ⚠️ High |
| **Proprietary** | N/A (no source code) | N/A | ❌ Very High |

**Why CivicBase chose AGPL:**
- Infrastructure improvements stay public
- Network service loophole closed (important for P2P)
- Vendor lock-in prevented
- Swedish municipalities benefit from shared innovation

---

**Questions not answered here?** Open a GitHub Discussion or email bjorn.kenneth.holmstrom@gmail.com

**CivicBase.** Public infrastructure. Public code. 🎯
