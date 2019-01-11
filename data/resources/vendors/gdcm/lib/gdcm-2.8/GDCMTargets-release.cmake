#----------------------------------------------------------------
# Generated CMake target import file for configuration "Release".
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "gdcmCommon" for configuration "Release"
set_property(TARGET gdcmCommon APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmCommon PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmCommon.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmCommon.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmCommon )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmCommon "${_IMPORT_PREFIX}/lib/gdcmCommon.lib" "${_IMPORT_PREFIX}/bin/gdcmCommon.dll" )

# Import target "gdcmDICT" for configuration "Release"
set_property(TARGET gdcmDICT APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmDICT PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmDICT.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmDICT.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmDICT )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmDICT "${_IMPORT_PREFIX}/lib/gdcmDICT.lib" "${_IMPORT_PREFIX}/bin/gdcmDICT.dll" )

# Import target "gdcmDSED" for configuration "Release"
set_property(TARGET gdcmDSED APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmDSED PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmDSED.lib"
  IMPORTED_LINK_DEPENDENT_LIBRARIES_RELEASE "gdcmzlib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmDSED.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmDSED )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmDSED "${_IMPORT_PREFIX}/lib/gdcmDSED.lib" "${_IMPORT_PREFIX}/bin/gdcmDSED.dll" )

# Import target "gdcmIOD" for configuration "Release"
set_property(TARGET gdcmIOD APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmIOD PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmIOD.lib"
  IMPORTED_LINK_DEPENDENT_LIBRARIES_RELEASE "gdcmexpat"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmIOD.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmIOD )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmIOD "${_IMPORT_PREFIX}/lib/gdcmIOD.lib" "${_IMPORT_PREFIX}/bin/gdcmIOD.dll" )

# Import target "gdcmMSFF" for configuration "Release"
set_property(TARGET gdcmMSFF APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmMSFF PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmMSFF.lib"
  IMPORTED_LINK_DEPENDENT_LIBRARIES_RELEASE "gdcmjpeg8;gdcmjpeg12;gdcmjpeg16;gdcmopenjp2;gdcmcharls"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmMSFF.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmMSFF )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmMSFF "${_IMPORT_PREFIX}/lib/gdcmMSFF.lib" "${_IMPORT_PREFIX}/bin/gdcmMSFF.dll" )

# Import target "gdcmMEXD" for configuration "Release"
set_property(TARGET gdcmMEXD APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmMEXD PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmMEXD.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmMEXD.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmMEXD )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmMEXD "${_IMPORT_PREFIX}/lib/gdcmMEXD.lib" "${_IMPORT_PREFIX}/bin/gdcmMEXD.dll" )

# Import target "gdcmjpeg8" for configuration "Release"
set_property(TARGET gdcmjpeg8 APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmjpeg8 PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmjpeg8.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmjpeg8.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmjpeg8 )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmjpeg8 "${_IMPORT_PREFIX}/lib/gdcmjpeg8.lib" "${_IMPORT_PREFIX}/bin/gdcmjpeg8.dll" )

# Import target "gdcmjpeg12" for configuration "Release"
set_property(TARGET gdcmjpeg12 APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmjpeg12 PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmjpeg12.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmjpeg12.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmjpeg12 )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmjpeg12 "${_IMPORT_PREFIX}/lib/gdcmjpeg12.lib" "${_IMPORT_PREFIX}/bin/gdcmjpeg12.dll" )

# Import target "gdcmjpeg16" for configuration "Release"
set_property(TARGET gdcmjpeg16 APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmjpeg16 PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmjpeg16.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmjpeg16.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmjpeg16 )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmjpeg16 "${_IMPORT_PREFIX}/lib/gdcmjpeg16.lib" "${_IMPORT_PREFIX}/bin/gdcmjpeg16.dll" )

# Import target "gdcmexpat" for configuration "Release"
set_property(TARGET gdcmexpat APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmexpat PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmexpat.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmexpat.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmexpat )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmexpat "${_IMPORT_PREFIX}/lib/gdcmexpat.lib" "${_IMPORT_PREFIX}/bin/gdcmexpat.dll" )

# Import target "gdcmopenjp2" for configuration "Release"
set_property(TARGET gdcmopenjp2 APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmopenjp2 PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmopenjp2.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmopenjp2.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmopenjp2 )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmopenjp2 "${_IMPORT_PREFIX}/lib/gdcmopenjp2.lib" "${_IMPORT_PREFIX}/bin/gdcmopenjp2.dll" )

# Import target "gdcmcharls" for configuration "Release"
set_property(TARGET gdcmcharls APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmcharls PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmcharls.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmcharls.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmcharls )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmcharls "${_IMPORT_PREFIX}/lib/gdcmcharls.lib" "${_IMPORT_PREFIX}/bin/gdcmcharls.dll" )

# Import target "gdcmmd5" for configuration "Release"
set_property(TARGET gdcmmd5 APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmmd5 PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmmd5.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmmd5.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmmd5 )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmmd5 "${_IMPORT_PREFIX}/lib/gdcmmd5.lib" "${_IMPORT_PREFIX}/bin/gdcmmd5.dll" )

# Import target "gdcmzlib" for configuration "Release"
set_property(TARGET gdcmzlib APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmzlib PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmzlib.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmzlib.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmzlib )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmzlib "${_IMPORT_PREFIX}/lib/gdcmzlib.lib" "${_IMPORT_PREFIX}/bin/gdcmzlib.dll" )

# Import target "gdcmgetopt" for configuration "Release"
set_property(TARGET gdcmgetopt APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmgetopt PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/gdcmgetopt.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmgetopt.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmgetopt )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmgetopt "${_IMPORT_PREFIX}/lib/gdcmgetopt.lib" "${_IMPORT_PREFIX}/bin/gdcmgetopt.dll" )

# Import target "socketxx" for configuration "Release"
set_property(TARGET socketxx APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(socketxx PROPERTIES
  IMPORTED_IMPLIB_RELEASE "${_IMPORT_PREFIX}/lib/socketxx.lib"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/socketxx.dll"
  )

list(APPEND _IMPORT_CHECK_TARGETS socketxx )
list(APPEND _IMPORT_CHECK_FILES_FOR_socketxx "${_IMPORT_PREFIX}/lib/socketxx.lib" "${_IMPORT_PREFIX}/bin/socketxx.dll" )

# Import target "gdcmdump" for configuration "Release"
set_property(TARGET gdcmdump APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmdump PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmdump.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmdump )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmdump "${_IMPORT_PREFIX}/bin/gdcmdump.exe" )

# Import target "gdcmdiff" for configuration "Release"
set_property(TARGET gdcmdiff APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmdiff PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmdiff.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmdiff )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmdiff "${_IMPORT_PREFIX}/bin/gdcmdiff.exe" )

# Import target "gdcmraw" for configuration "Release"
set_property(TARGET gdcmraw APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmraw PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmraw.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmraw )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmraw "${_IMPORT_PREFIX}/bin/gdcmraw.exe" )

# Import target "gdcmscanner" for configuration "Release"
set_property(TARGET gdcmscanner APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmscanner PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmscanner.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmscanner )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmscanner "${_IMPORT_PREFIX}/bin/gdcmscanner.exe" )

# Import target "gdcmanon" for configuration "Release"
set_property(TARGET gdcmanon APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmanon PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmanon.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmanon )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmanon "${_IMPORT_PREFIX}/bin/gdcmanon.exe" )

# Import target "gdcmgendir" for configuration "Release"
set_property(TARGET gdcmgendir APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmgendir PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmgendir.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmgendir )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmgendir "${_IMPORT_PREFIX}/bin/gdcmgendir.exe" )

# Import target "gdcmimg" for configuration "Release"
set_property(TARGET gdcmimg APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmimg PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmimg.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmimg )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmimg "${_IMPORT_PREFIX}/bin/gdcmimg.exe" )

# Import target "gdcmconv" for configuration "Release"
set_property(TARGET gdcmconv APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmconv PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmconv.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmconv )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmconv "${_IMPORT_PREFIX}/bin/gdcmconv.exe" )

# Import target "gdcmtar" for configuration "Release"
set_property(TARGET gdcmtar APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmtar PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmtar.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmtar )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmtar "${_IMPORT_PREFIX}/bin/gdcmtar.exe" )

# Import target "gdcminfo" for configuration "Release"
set_property(TARGET gdcminfo APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcminfo PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcminfo.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcminfo )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcminfo "${_IMPORT_PREFIX}/bin/gdcminfo.exe" )

# Import target "gdcmscu" for configuration "Release"
set_property(TARGET gdcmscu APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmscu PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmscu.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmscu )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmscu "${_IMPORT_PREFIX}/bin/gdcmscu.exe" )

# Import target "gdcmxml" for configuration "Release"
set_property(TARGET gdcmxml APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmxml PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmxml.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmxml )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmxml "${_IMPORT_PREFIX}/bin/gdcmxml.exe" )

# Import target "gdcmpap3" for configuration "Release"
set_property(TARGET gdcmpap3 APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(gdcmpap3 PROPERTIES
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/bin/gdcmpap3.exe"
  )

list(APPEND _IMPORT_CHECK_TARGETS gdcmpap3 )
list(APPEND _IMPORT_CHECK_FILES_FOR_gdcmpap3 "${_IMPORT_PREFIX}/bin/gdcmpap3.exe" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
