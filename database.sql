CREATE TABLE connections (
  data json DEFAULT NULL,
  alias varchar(30) GENERATED ALWAYS AS (JSON_UNQUOTE(data->'$.alias')) VIRTUAL NOT NULL,
  UNIQUE KEY alias (alias)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE users (
  data json DEFAULT NULL,
  username varchar(30) GENERATED ALWAYS AS (JSON_UNQUOTE(data->'$.username')) VIRTUAL NOT NULL,
  UNIQUE KEY user (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE logs (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  user text,
  db_alias text,
  sql_text text,
  reason text,
  query_time bigint(20) DEFAULT NULL,
  verify_code text,
  rowNum text,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=504 DEFAULT CHARSET=utf8;

CREATE TABLE 