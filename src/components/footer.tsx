import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Footer(): JSX.Element {
  return (
    <>
      <div className="is-flex is-flex-wrap-wrap is-flex-directino-row is-justify-content-center">
        <div className="is-flex if-flex-wrap-wrap is-flex-direction-column is-align-items-center has-text-centered is-size-5">
          <h4 className="has-text-weight-bold">Project by K. Wajakajornrit</h4>
          <span className="icon-text">
            <h4 className="has-text-weight-bold">Contribute with us on</h4>
            <a
              href="https://github.com/bossoq/MarketStatisticsReact"
              target="_blank"
              rel="noreferrer"
            >
              <span className="icon mr-1 ml-1">
                <FontAwesomeIcon icon={faGithub} size="1x" />
              </span>
            </a>
          </span>
        </div>
      </div>
    </>
  );
}
