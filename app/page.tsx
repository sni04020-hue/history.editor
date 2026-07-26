import Link from "next/link";
import { getPortalDocument } from "../lib/portal-store";
import { PortalElements, portalTextStyle } from "./portal-elements";

export const dynamic = "force-dynamic";

export default async function Home() {
  const portal = await getPortalDocument();
  return <main className="portal-landing">
    <div className="portal-noise" />
    <div className="core-rings" aria-hidden="true"><i /><i /><i /><b /></div>
    <section className="portal-entry">
      <p className="portal-eyebrow portal-styled-text" style={portalTextStyle(portal.site.styles?.eyebrow)}>{portal.site.eyebrow}</p>
      <p className="portal-series portal-styled-text" style={portalTextStyle(portal.site.styles?.subtitle)}>{portal.site.subtitle}</p>
      <h1 className="portal-styled-text" style={portalTextStyle(portal.site.styles?.title)}>{portal.site.title}</h1>
      <p className="portal-description portal-styled-text" style={portalTextStyle(portal.site.styles?.description)}>{portal.site.description}</p>
      <PortalElements elements={portal.site.elements} className="portal-entry-elements" />
      <Link className="core-entry-button portal-styled-text" style={portalTextStyle(portal.site.styles?.entryLabel)} href="/courses"><span>{portal.site.entryLabel}</span><i>→</i></Link>
      <p className="portal-footnote portal-styled-text" style={portalTextStyle(portal.site.styles?.footer)}>{portal.site.footer}</p>
    </section>
  </main>;
}
