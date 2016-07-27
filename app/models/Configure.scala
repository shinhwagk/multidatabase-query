package models

import com.typesafe.config.ConfigFactory

/**
  * Created by zhangxu on 2016/7/27.
  */
object Configure {
  private val conf = ConfigFactory.load()
  val _query_number = conf.getInt("wex.query.number")
  val _query_page_span = conf.getInt("wex.query.pageSpan")
}
