import Typography from "typography"
import wordpress2016Theme from 'typography-theme-wordpress-2016'

wordpress2016Theme.overrideThemeStyles = () => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
    "h1": {
      fontWeight: `normal`,
    }
  }
}

const typography = new Typography(wordpress2016Theme)

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
