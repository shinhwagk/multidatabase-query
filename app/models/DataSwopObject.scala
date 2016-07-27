package models

/**
  * Created by zhangxu on 2016/7/25.
  */
object DataSwopObject {

  case class DatabaseInfo(alias: String, ip: String, port: Int, service: String, username: String, password: String)

  case class Users(id: Int = 0,
                   username: String,
                   sqlgroups: Map[String, List[String]] = Map("defalut" -> List.empty),
                   allquerynumber: Int = 0,
                   privilege: List[String] = List.empty,
                   admin: Int = 0,
                   lastsql: String = "")

  case class QueryConfig(queryfull: Boolean, page: Int, sqltext: String, reason: String, server: String, offset: Int)

  case class QueryReslt(result: Option[String] = None, error: Boolean = false, errorString: Option[String] = None)

  case class JdbcReslt(result: Option[String] = None, errorString: Option[String] = None)

}
