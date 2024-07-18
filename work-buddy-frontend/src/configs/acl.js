import { AbilityBuilder, Ability } from '@casl/ability'
import { ROLE_ADMIN, ROLE_STUDENT, ROLE_TEACHER } from '../constants/constant'

export const AppAbility = Ability

const defineRulesFor = (role, subject) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  const rolePermissions = {
    [ROLE_ADMIN]: { action: 'manage', subject: 'all' },
    [ROLE_TEACHER]: { action: 'manage', subject: ROLE_TEACHER },
    [ROLE_STUDENT]: { action: 'manage', subject: ROLE_STUDENT },
  }

  const defaultPermissions = ['read', 'create', 'update', 'delete']
  const userPermissions = rolePermissions[role] || { action: defaultPermissions, subject }

  can(userPermissions.action, userPermissions.subject)

  return rules
}

export const buildAbilityFor = (role, subject) => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object.type
  })
}

export const defaultACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
