/**
 * Fetch group
 */

export const createAbortGroup = () => {
  const controllers = new Set<AbortController>()

  return {
    controllers,
    cancel: () => {
      controllers.forEach((controller) => {
        controller.abort("Aborted controller group")
        controllers.delete(controller)
      })

      return controllers
    },
    add: () => {
      const controller = new AbortController()
      controllers.add(controller)
      return controller
    },
  }
}
