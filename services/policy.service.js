import { ROLE_POLICY_MAP } from "../config/rolePolicyMap.js";
import { POLICIES } from "../utils/constants/policies.js";

export async function checkPolicy({ user, policy, resourceUserId = null }) {
    const userPolicies = ROLE_POLICY_MAP[user.role] || [];
    console.log(resourceUserId, user.id);
    console.log(policy);
    console.log("User Policies:", userPolicies);

    if (!userPolicies.includes(policy)) {
        return false;
    }
    if (policy === POLICIES.USER_VIEW_SELF || policy === POLICIES.USER_EDIT) {
        return user.id === Number(resourceUserId);
    }
    return true;
}